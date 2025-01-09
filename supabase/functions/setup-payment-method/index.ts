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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      usage: 'off_session', // Important for future payments
      customer: await getOrCreateCustomer(stripe, user.email || ''),
    });

    console.log('✅ Setup intent created:', setupIntent.client_secret);

    return new Response(
      JSON.stringify({ 
        clientSecret: setupIntent.client_secret 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('❌ Error creating setup intent:', error);
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