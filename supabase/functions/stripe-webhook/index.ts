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
  console.log('Received webhook request');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found in headers:', Object.fromEntries(req.headers));
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured in environment');
      throw new Error('Stripe webhook secret not configured');
    }

    console.log('Constructing Stripe event with signature:', signature.substring(0, 20) + '...');
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error constructing event:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully constructed Stripe event:', {
      type: event.type,
      mode: event.livemode ? 'live' : 'test',
      id: event.id
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Processing checkout session:', {
        id: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata
      });
      
      const { auction_id } = session.metadata || {};

      if (!auction_id) {
        console.error('No auction ID found in session metadata');
        throw new Error('No auction ID found in session metadata');
      }

      if (session.payment_status !== 'paid') {
        console.error('Payment not completed:', session.payment_status);
        throw new Error('Payment not completed');
      }

      console.log('Updating payment status for auction:', auction_id);

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

      console.log('Successfully updated payment status for auction:', auction_id);

      // Create a notification for the seller
      const { data: artwork, error: artworkError } = await supabaseClient
        .from('artworks')
        .select('title, created_by')
        .eq('id', auction_id)
        .single();

      if (artworkError) {
        console.error('Error fetching artwork details:', artworkError);
      } else if (artwork?.created_by) {
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: artwork.created_by,
            title: 'Payment Received',
            message: `Payment has been completed for your artwork "${artwork.title}"`,
            type: 'payment_received'
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        } else {
          console.log('Successfully created notification for seller');
        }
      }

      console.log('Payment completed successfully for auction:', auction_id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});