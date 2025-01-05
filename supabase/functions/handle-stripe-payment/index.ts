import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders, createStripeClient, handleCheckoutComplete } from './stripe-utils.ts';

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

    // Get the raw body as ArrayBuffer and convert to string
    const rawBody = await req.arrayBuffer();
    const rawBodyString = new TextDecoder().decode(rawBody);
    
    console.log(`[${requestId}] Raw body received, length:`, rawBodyString.length);
    console.log(`[${requestId}] Signature:`, signature);
    console.log(`[${requestId}] Webhook secret length:`, (Deno.env.get('STRIPE_WEBHOOK_SECRET') || '').length);
    
    const stripe = createStripeClient();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBodyString,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error(`[${requestId}] Error constructing webhook event:`, err);
      console.error(`[${requestId}] Error details:`, {
        signatureLength: signature.length,
        bodyPreview: rawBodyString.substring(0, 100) + '...',
        webhookSecretExists: !!Deno.env.get('STRIPE_WEBHOOK_SECRET')
      });
      throw new Error(`Webhook Error: ${err.message}`);
    }

    console.log(`[${requestId}] Event type: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`[${requestId}] Processing completed checkout session:`, session.id);

      await handleCheckoutComplete(session, supabaseClient);
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