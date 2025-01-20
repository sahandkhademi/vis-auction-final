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

    console.log('🔔 Processing charge for auction:', auctionId);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auction details with winner information
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
      console.error('❌ Error fetching auction:', auctionError);
      throw new Error('Auction not found');
    }

    console.log('📦 Auction details:', {
      id: auction.id,
      winner_id: auction.winner?.id,
      winner_email: auction.winner?.email,
      price: auction.current_price
    });

    if (!auction.winner) {
      console.error('❌ No winner found for auction');
      throw new Error('No winner found for auction');
    }

    // Verify the winner's email exists
    if (!auction.winner.email) {
      console.error('❌ Winner has no email address:', auction.winner.id);
      throw new Error('Winner has no email address');
    }

    // Get winner's payment method
    const { data: paymentMethod, error: paymentMethodError } = await supabaseClient
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', auction.winner.id)
      .eq('is_valid', true)
      .single();

    if (paymentMethodError) {
      console.error('❌ Error fetching payment method:', paymentMethodError);
      throw new Error('Error fetching payment method');
    }

    if (!paymentMethod) {
      console.error('❌ No valid payment method found for winner:', auction.winner.id);
      throw new Error('No valid payment method found for winner');
    }

    console.log('💳 Found payment method:', {
      id: paymentMethod.stripe_payment_method_id,
      brand: paymentMethod.card_brand,
      last_four: paymentMethod.last_four
    });

    // Get or create customer
    let customerId;
    const customers = await stripe.customers.list({
      email: auction.winner.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('👤 Using existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: auction.winner.email,
      });
      customerId = customer.id;
      console.log('👤 Created new customer:', customerId);
    }

    // Verify the payment method is attached to the customer
    try {
      await stripe.paymentMethods.attach(paymentMethod.stripe_payment_method_id, {
        customer: customerId,
      });
      console.log('✅ Payment method attached to customer');
    } catch (error) {
      if (error.code !== 'payment_method_already_attached') {
        console.error('❌ Error attaching payment method:', error);
        throw error;
      }
    }

    // Create payment intent
    console.log('💰 Creating payment intent for amount:', Math.round(auction.current_price * 100));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(auction.current_price * 100),
      currency: 'eur',
      customer: customerId,
      payment_method: paymentMethod.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      payment_method_types: ['card'],
      setup_future_usage: 'off_session',
    });

    console.log('✅ Payment intent created:', paymentIntent.id, 'status:', paymentIntent.status);

    // Update auction with payment intent
    const { error: updateError } = await supabaseClient
      .from('artworks')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed'
      })
      .eq('id', auctionId);

    if (updateError) {
      console.error('❌ Error updating auction:', updateError);
      throw updateError;
    }

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