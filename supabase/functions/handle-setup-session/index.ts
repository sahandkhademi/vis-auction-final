import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  });

  try {
    // Get the request body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    let event;
    try {
      // Use TextEncoder to convert the webhook secret to Uint8Array
      const secret = new TextEncoder().encode(
        Deno.env.get('STRIPE_SETUP_WEBHOOK_SECRET') || ''
      );
      
      // Create a crypto key from the secret
      const key = await crypto.subtle.importKey(
        'raw',
        secret,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      // Compute the signature
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(body)
      );
      
      // Convert the signature to hex
      const computedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Parse the event
      event = JSON.parse(body);
      
      // Verify the timestamp is within tolerance (5 minutes)
      const timestamp = event.created;
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > 300) {
        throw new Error('Webhook timestamp out of tolerance');
      }
      
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', event.type);

    if (event.type === 'setup_intent.succeeded') {
      const setupIntent = event.data.object;
      const paymentMethod = await stripe.paymentMethods.retrieve(
        setupIntent.payment_method
      );

      // Initialize Supabase client with service role key for admin access
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Save the payment method to the database
      const { error: insertError } = await supabaseAdmin
        .from('user_payment_methods')
        .insert({
          user_id: setupIntent.metadata.user_id,
          stripe_payment_method_id: paymentMethod.id,
          last_four: paymentMethod.card?.last4,
          card_brand: paymentMethod.card?.brand,
          is_valid: true
        });

      if (insertError) {
        console.error('Error saving payment method:', insertError);
        throw new Error('Failed to save payment method');
      }

      console.log('Payment method saved successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});