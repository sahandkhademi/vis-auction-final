import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from "./stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('🔔 Webhook received:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe signature present:', !!signature);

    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the raw body
    const body = await req.text();
    console.log('Webhook body length:', body.length);
    console.log('Webhook body preview:', body.substring(0, 100));

    // Verify the webhook signature
    let event;
    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      console.log('Webhook secret present:', !!webhookSecret);
      
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || ''
      );
      console.log('Event constructed successfully:', event.type);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    console.log('Supabase client created with service role');

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('💰 Checkout session completed!', session.id);
        console.log('Session metadata:', session.metadata);
        
        if (session.metadata?.artwork_id) {
          console.log('Updating artwork payment status for:', session.metadata.artwork_id);
          const { error } = await supabase
            .from('artworks')
            .update({ payment_status: 'completed' })
            .eq('id', session.metadata.artwork_id);
          
          if (error) {
            console.error('Error updating artwork payment status:', error);
          } else {
            console.log('✅ Updated artwork payment status to completed');
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const paymentFailedIntent = event.data.object;
        console.log('❌ PaymentIntent failed:', paymentFailedIntent.id);
        break;
        
      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});