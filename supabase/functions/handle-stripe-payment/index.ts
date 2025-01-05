import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the raw body as text
    const rawBody = await req.text();
    console.log('Raw webhook body:', rawBody);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error('Error constructing webhook event:', err);
      return new Response(
        JSON.stringify({ error: err.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Webhook event type:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', session.id);

      if (session.metadata?.auction_id) {
        const auctionId = session.metadata.auction_id;
        console.log('Updating payment status for auction:', auctionId);

        // First, verify the auction exists and get its current status
        const { data: auction, error: fetchError } = await supabaseClient
          .from('artworks')
          .select('completion_status, payment_status')
          .eq('id', auctionId)
          .single();

        if (fetchError) {
          console.error('Error fetching artwork:', fetchError);
          throw fetchError;
        }

        if (!auction) {
          throw new Error(`Auction ${auctionId} not found`);
        }

        // Update the payment status
        const { error: updateError } = await supabaseClient
          .from('artworks')
          .update({ 
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);

        if (updateError) {
          console.error('Error updating artwork payment status:', updateError);
          throw updateError;
        }

        console.log('Payment status updated successfully for auction:', auctionId);

        // Create a notification for the seller
        const { data: artwork } = await supabaseClient
          .from('artworks')
          .select('title, artist_id')
          .eq('id', auctionId)
          .single();

        if (artwork?.artist_id) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: artwork.artist_id,
              title: 'Payment Received',
              message: `Payment has been completed for your artwork: ${artwork.title}`,
              type: 'payment_received'
            });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});