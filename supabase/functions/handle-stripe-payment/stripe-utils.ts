import Stripe from 'https://esm.sh/stripe@14.21.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

export const createStripeClient = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  
  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
};

export const handleCheckoutComplete = async (session: Stripe.Checkout.Session, supabaseClient: any) => {
  if (!session.metadata?.auction_id) {
    throw new Error('Missing auction_id in session metadata');
  }

  const auctionId = session.metadata.auction_id;
  console.log(`[${session.id}] Updating payment status for auction:`, auctionId);

  // Verify the payment intent status
  const stripe = createStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
  if (paymentIntent.status !== 'succeeded') {
    throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
  }

  // Update payment status
  const { error: updateError } = await supabaseClient
    .from('artworks')
    .update({ 
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', auctionId);

  if (updateError) {
    console.error(`[${session.id}] Error updating artwork payment status:`, updateError);
    throw updateError;
  }

  console.log(`[${session.id}] Payment status updated successfully`);
};