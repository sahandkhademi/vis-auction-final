import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log('Webhook request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers)
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    console.error('Missing authorization header');
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe signature received:', signature);

    if (!signature) {
      console.error('No Stripe signature found in headers');
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Webhook secret configured:', webhookSecret.substring(0, 4) + '...');

    const body = await req.text();
    console.log('Request body received:', body.substring(0, 100) + '...');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error constructing event:', {
        error: err.message,
        signature: signature,
        bodyPreview: body.substring(0, 100)
      });
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully constructed Stripe event:', {
      type: event.type,
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
      
      const { auction_id, user_id } = session.metadata || {};
      if (!auction_id) {
        console.error('No auction ID found in session metadata');
        throw new Error('No auction ID found in session metadata');
      }

      console.log('Updating payment status for auction:', auction_id);

      // First, verify the auction exists and belongs to the user
      const { data: auction, error: auctionError } = await supabaseClient
        .from('artworks')
        .select('id, winner_id, title, created_by')
        .eq('id', auction_id)
        .single();

      if (auctionError) {
        console.error('Error fetching auction:', auctionError);
        throw auctionError;
      }

      if (!auction) {
        console.error('Auction not found:', auction_id);
        throw new Error('Auction not found');
      }

      if (auction.winner_id !== user_id) {
        console.error('User is not the winner of this auction');
        throw new Error('User is not the winner of this auction');
      }

      // Update the payment status
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

      // Create notifications for both buyer and seller
      const notifications = [
        {
          user_id: user_id,
          title: 'Payment Successful',
          message: `Your payment for "${auction.title}" has been completed. Thank you for your purchase!`,
          type: 'payment_completed'
        }
      ];

      // Add seller notification if the auction has a creator
      if (auction.created_by) {
        notifications.push({
          user_id: auction.created_by,
          title: 'Payment Received',
          message: `Payment has been completed for your artwork "${auction.title}"`,
          type: 'payment_received'
        });
      }

      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        // Don't throw here, as the payment processing was successful
      } else {
        console.log('Successfully created notifications');
      }
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});