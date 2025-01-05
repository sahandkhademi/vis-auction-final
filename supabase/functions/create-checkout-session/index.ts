import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔔 Checkout session request received:', new Date().toISOString());
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    console.log('Processing auction ID:', auctionId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get auction details with enhanced error handling
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('Error fetching auction:', auctionError);
      throw new Error(`Failed to fetch auction: ${auctionError.message}`);
    }

    if (!auction) {
      console.error('Auction not found:', auctionId);
      throw new Error('Auction not found');
    }

    // Validate auction status
    if (auction.status !== 'published' || auction.completion_status !== 'completed') {
      console.error('Invalid auction status:', auction.status, auction.completion_status);
      throw new Error('Invalid auction status');
    }

    // Get the authenticated user with enhanced validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) {
      console.error('Error fetching user:', userError);
      throw new Error('Authentication failed');
    }

    if (!user || user.id !== auction.winner_id) {
      console.error('Unauthorized user attempt:', user?.id);
      throw new Error('Unauthorized: Only the auction winner can make a payment');
    }

    console.log('Creating Stripe instance...');
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    // Create checkout session with additional metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: auction.title,
              description: `Artwork by ${auction.artist}`,
              images: auction.image_url ? [auction.image_url] : undefined,
              metadata: {
                artwork_id: auction.id,
                artist: auction.artist,
              },
            },
            unit_amount: Math.round(auction.current_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/auction/${auctionId}?payment=success`,
      cancel_url: `${req.headers.get('origin')}/auction/${auctionId}?payment=cancelled`,
      metadata: {
        auction_id: auctionId,
        user_id: user.id,
        environment: 'production',
        artwork_title: auction.title,
        artist: auction.artist,
      },
      payment_intent_data: {
        metadata: {
          auction_id: auctionId,
          user_id: user.id,
        },
      },
    });

    console.log('✅ Checkout session created successfully:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});