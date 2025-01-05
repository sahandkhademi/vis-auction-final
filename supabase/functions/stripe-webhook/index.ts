import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from "./stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Set CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'stripe-signature'
};

console.log('🔔 Stripe webhook function loaded');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Log all headers for debugging
    const headers = Object.fromEntries(req.headers.entries());
    console.log('All request headers:', JSON.stringify(headers, null, 2));

    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe signature:', signature);

    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the raw body
    const rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);
    console.log('First 100 chars of raw body:', rawBody.substring(0, 100));

    // Get webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      console.log('Attempting to construct event with signature...');
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('✅ Event constructed successfully:', event.type);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Processing event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('💰 Checkout session completed:', session.id);
        console.log('Session metadata:', session.metadata);
        
        if (session.metadata?.auction_id) {
          console.log('Updating artwork payment status for:', session.metadata.auction_id);
          const { error } = await supabaseAdmin
            .from('artworks')
            .update({ payment_status: 'completed' })
            .eq('id', session.metadata.auction_id);
          
          if (error) {
            console.error('Error updating artwork payment status:', error);
            throw error;
          }
          console.log('✅ Updated artwork payment status to completed');
        } else {
          console.error('No auction_id in session metadata');
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        break;
      }
        
      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});