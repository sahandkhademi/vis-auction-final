import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

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
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing Stripe webhook event:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { auction_id } = session.metadata || {};

      if (!auction_id) {
        throw new Error('No auction ID found in session metadata');
      }

      // Update auction payment status
      const { error: updateError } = await supabaseClient
        .from('artworks')
        .update({ 
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', auction_id);

      if (updateError) {
        throw updateError;
      }

      // Create a notification for the seller
      const { data: artwork } = await supabaseClient
        .from('artworks')
        .select('title, created_by')
        .eq('id', auction_id)
        .single();

      if (artwork?.created_by) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: artwork.created_by,
            title: 'Payment Received',
            message: `Payment has been completed for your artwork "${artwork.title}"`,
            type: 'payment_received'
          });
      }

      console.log(`Payment completed for auction ${auction_id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});