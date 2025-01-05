import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting Stripe checkout process...');
    const { auctionId } = await req.json();
    console.log('Auction ID:', auctionId);

    // Create Stripe instance
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get auction details from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/artworks?id=eq.${auctionId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    const [artwork] = await response.json();
    if (!artwork) {
      throw new Error('Artwork not found');
    }

    console.log('Creating checkout session for artwork:', artwork.title);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: artwork.title,
              description: `Artwork by ${artwork.artist}`,
              images: artwork.image_url ? [artwork.image_url] : undefined,
            },
            unit_amount: Math.round(artwork.current_price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/auction/${auctionId}?payment=success`,
      cancel_url: `${req.headers.get('origin')}/auction/${auctionId}?payment=cancelled`,
      metadata: {
        auction_id: auctionId,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});