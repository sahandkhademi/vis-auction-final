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
      console.error('No Stripe signature found');
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      throw new Error('Stripe webhook secret not configured');
    }

    console.log('Constructing Stripe event...');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing Stripe webhook event:', event.type, 'Mode:', event.livemode ? 'live' : 'test');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id, 'Payment status:', session.payment_status);
      
      const { auction_id } = session.metadata || {};

      if (!auction_id) {
        console.error('No auction ID found in session metadata');
        throw new Error('No auction ID found in session metadata');
      }

      // Verify the payment was successful
      if (session.payment_status !== 'paid') {
        console.error('Payment not completed:', session.payment_status);
        throw new Error('Payment not completed');
      }

      console.log('Updating payment status for auction:', auction_id);

      // Update auction payment status
      const { error: updateError } = await supabaseClient
        .from('artworks')
        .update({ 
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', auction_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
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

      console.log('Payment completed successfully for auction:', auction_id);
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