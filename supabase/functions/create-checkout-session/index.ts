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
    console.log('Auction ID:', auctionId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      console.error('Error fetching auction:', auctionError);
      throw new Error('Auction not found');
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user || user.id !== auction.winner_id) {
      console.error('Unauthorized user attempt:', user?.id);
      throw new Error('Unauthorized');
    }

    console.log('Creating Stripe instance with secret key...');
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating checkout session...');
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
            },
            unit_amount: Math.round(auction.current_price * 100), // Convert to cents
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});