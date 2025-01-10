import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature found');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_SETUP_WEBHOOK_SECRET') || ''
    );

    console.log('✅ Webhook event received:', event.type);

    if (event.type === 'setup_intent.succeeded') {
      const setupIntent = event.data.object as Stripe.SetupIntent;
      const paymentMethod = await stripe.paymentMethods.retrieve(
        setupIntent.payment_method as string
      );

      console.log('✅ Payment method retrieved:', paymentMethod.id);

      // Save the payment method to our database
      const { error } = await supabaseClient
        .from('user_payment_methods')
        .insert({
          user_id: setupIntent.metadata.user_id,
          stripe_payment_method_id: paymentMethod.id,
          last_four: paymentMethod.card?.last4,
          card_brand: paymentMethod.card?.brand,
          is_valid: true,
        });

      if (error) {
        console.error('❌ Error saving payment method:', error);
        throw error;
      }

      console.log('✅ Payment method saved to database');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('❌ Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});