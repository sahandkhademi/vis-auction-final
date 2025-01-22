import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    
    if (!auctionId) {
      throw new Error('Auction ID is required');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          id,
          email
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      throw new Error('Auction not found');
    }

    if (!auction.winner) {
      throw new Error('No winner found for auction');
    }

    // Get winner's payment method
    const { data: paymentMethod } = await supabaseClient
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', auction.winner.id)
      .eq('is_valid', true)
      .single();

    if (!paymentMethod) {
      throw new Error('No valid payment method found for winner');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(auction.current_price * 100), // Convert to cents
      currency: 'eur',
      customer: await getOrCreateCustomer(stripe, auction.winner.email || ''),
      payment_method: paymentMethod.stripe_payment_method_id,
      off_session: true,
      confirm: true,
    });

    // Update auction with payment intent
    await supabaseClient
      .from('artworks')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed'
      })
      .eq('id', auctionId);

    console.log('✅ Winner charged successfully:', paymentIntent.id);

    return new Response(
      JSON.stringify({ success: true, paymentIntentId: paymentIntent.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('❌ Error charging winner:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function getOrCreateCustomer(stripe: Stripe, email: string): Promise<string> {
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email: email,
  });

  return customer.id;
}