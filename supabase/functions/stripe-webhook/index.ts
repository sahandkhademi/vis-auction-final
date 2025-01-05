import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from "./stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Set CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log('🔔 Stripe webhook function loaded');

serve(async (req) => {
  console.log('🔔 Webhook received:', new Date().toISOString());

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
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

    // Get the raw body as text
    const rawBody = await req.text();
    console.log('Webhook signature:', signature);
    console.log('Raw body length:', rawBody.length);

    // Verify the webhook signature
    let event;
    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
      }
      
      console.log('Constructing event with signature...');
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
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role key for admin access
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