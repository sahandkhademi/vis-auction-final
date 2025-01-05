import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId, amount } = await req.json();
    console.log(`[${requestId}] Processing payment for auction:`, auctionId, 'amount:', amount);

    if (!auctionId || !amount) {
      throw new Error('Missing required parameters: auctionId or amount');
    }

    // Create Stripe instance
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get origin from request headers or use a default
    let origin = req.headers.get('origin');
    if (!origin) {
      console.warn(`[${requestId}] No origin header found, using default`);
      origin = 'http://localhost:5173';
    }
    console.log(`[${requestId}] Using origin:`, origin);

    // Create base URLs for success and cancel
    const baseUrl = `${origin}/auction/${auctionId}`;
    const successUrl = `${baseUrl}?payment_success=true`;
    const cancelUrl = `${baseUrl}?payment_cancelled=true`;

    console.log(`[${requestId}] Success URL:`, successUrl);
    console.log(`[${requestId}] Cancel URL:`, cancelUrl);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Auction Payment #${auctionId}`,
              description: `Payment for auction ${auctionId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        auction_id: auctionId,
      },
    });

    console.log(`[${requestId}] ✅ Checkout session created:`, session.id);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error(`[${requestId}] ❌ Error creating checkout session:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});