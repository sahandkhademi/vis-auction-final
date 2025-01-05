import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error(`[${requestId}] Missing Stripe signature`);
      throw new Error('Missing Stripe signature');
    }

    const rawBody = await req.text(); // Get the raw body as text
    console.log(`[${requestId}] Raw body received, length: ${rawBody.length}`);
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error(`[${requestId}] Error constructing webhook event:`, err);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    console.log(`[${requestId}] Event type: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`[${requestId}] Processing completed checkout session:`, session.id);

      if (!session.metadata?.auction_id) {
        throw new Error('Missing auction_id in session metadata');
      }

      const auctionId = session.metadata.auction_id;
      console.log(`[${requestId}] Updating payment status for auction:`, auctionId);

      // Verify the payment intent status
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
      }

      // Update the artwork payment status
      const { error: updateError } = await supabaseClient
        .from('artworks')
        .update({ 
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId);

      if (updateError) {
        console.error(`[${requestId}] Error updating artwork payment status:`, updateError);
        throw updateError;
      }

      console.log(`[${requestId}] Payment status updated successfully`);
    }

    return new Response(
      JSON.stringify({ received: true, requestId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Webhook error:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});