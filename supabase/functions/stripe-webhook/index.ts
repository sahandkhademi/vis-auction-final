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
  console.log(`[${new Date().toISOString()}] Received webhook request`);
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get the raw body first - crucial for signature verification
    const rawBody = await req.text();
    console.log('📦 Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 100) + '...');

    // Get the stripe signature
    const signature = req.headers.get('stripe-signature');
    console.log('🔑 Stripe signature:', signature ? 'Present' : 'Missing');

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
    console.log('Webhook secret present:', !!webhookSecret);
    
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

    // Verify the webhook signature
    let event;
    try {
      console.log('🔍 Attempting signature verification...');
      console.log('Webhook secret length:', webhookSecret.length);
      console.log('Signature length:', signature.length);
      
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('✅ Webhook verified successfully');
      console.log('📣 Event type:', event.type);
      console.log('Event data:', JSON.stringify(event.data, null, 2));
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      console.error('Error details:', err);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
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

    console.log('✅ Webhook processing completed successfully');
    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});