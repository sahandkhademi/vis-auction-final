import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from "./stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Get the raw body first - crucial for signature verification
    const rawBody = await req.text();
    console.log('📦 Received webhook payload length:', rawBody.length);

    // Get the stripe signature - must be exact header from Stripe
    const signature = req.headers.get('stripe-signature');
    console.log('🔑 Stripe signature present:', !!signature);

    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return new Response(
        JSON.stringify({ error: 'Missing signature header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the webhook signature with raw body
    let event;
    try {
      console.log('🔍 Attempting signature verification...');
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('✅ Webhook verified successfully');
      console.log('📣 Event type:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
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

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('💰 Processing completed checkout:', session.id);
        
        if (session.metadata?.auction_id) {
          console.log('🎨 Updating artwork payment status for:', session.metadata.auction_id);
          const { error } = await supabaseAdmin
            .from('artworks')
            .update({ payment_status: 'completed' })
            .eq('id', session.metadata.auction_id);
          
          if (error) {
            console.error('❌ Error updating artwork payment status:', error);
            throw error;
          }
          console.log('✅ Payment status updated successfully');
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        console.log('💫 Payment intent succeeded:', event.data.object.id);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      }
        
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
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