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
    const { paymentMethodId } = await req.json();
    
    if (!paymentMethodId) {
      throw new Error('Payment method ID is required');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    // Create a $1 payment intent to validate the card
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      customer: await getOrCreateCustomer(stripe, user.email || ''),
    });

    // If we get here, the card is valid. Save to database.
    if (paymentMethod.card) {
      await supabaseClient
        .from('user_payment_methods')
        .upsert({
          user_id: user.id,
          stripe_payment_method_id: paymentMethodId,
          last_four: paymentMethod.card.last4,
          card_brand: paymentMethod.card.brand,
          is_valid: true,
        });
    }

    // Immediately refund the validation charge
    if (paymentIntent.status === 'succeeded') {
      await stripe.refunds.create({
        payment_intent: paymentIntent.id,
      });
    }

    console.log('✅ Payment method validated and saved');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('❌ Error validating payment method:', error);
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