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
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const body = await req.text();
    console.log('Webhook body:', body);
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    console.log('Using webhook secret:', webhookSecret ? 'Secret is set' : 'Secret is missing');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || ''
      );
      console.log('Successfully constructed webhook event:', event.type);
    } catch (err) {
      console.error('Error constructing webhook event:', err);
      return new Response(
        JSON.stringify({ 
          error: 'Webhook signature verification failed',
          details: err.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

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

        const { error } = await supabaseClient
          .from('artworks')
          .update({ 
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);

        if (error) {
          console.error('Error updating artwork payment status:', error);
          throw error;
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
          
          console.log('Notification created for artist:', artwork.artist_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});