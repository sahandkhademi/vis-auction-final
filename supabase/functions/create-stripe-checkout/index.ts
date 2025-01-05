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
    const { auctionId, amount } = await req.json();
    console.log('Auction ID:', auctionId, 'Amount:', amount);

    if (!auctionId || !amount) {
      throw new Error('Missing required parameters: auctionId or amount');
    }

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

    // Get origin from request headers or use a fallback
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log('Using origin:', origin);

    // Ensure the origin is a valid URL
    try {
      new URL(origin);
    } catch (e) {
      console.error('Invalid origin:', origin);
      throw new Error('Invalid origin URL');
    }

    // Construct success and cancel URLs
    const successUrl = new URL(`/auction/${auctionId}`, origin);
    successUrl.searchParams.append('payment_success', 'true');
    
    const cancelUrl = new URL(`/auction/${auctionId}`, origin);
    cancelUrl.searchParams.append('payment_cancelled', 'true');

    console.log('Success URL:', successUrl.toString());
    console.log('Cancel URL:', cancelUrl.toString());

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
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
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