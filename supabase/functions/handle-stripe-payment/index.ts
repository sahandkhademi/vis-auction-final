import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getEmailContent } from '../send-auction-update/email-templates.ts';
import { sendEmail } from '../send-auction-update/email-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] Request received - ID: ${requestId}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error(`[${requestId}] Missing Stripe signature`);
      throw new Error('Missing Stripe signature');
    }

    const rawBody = await req.arrayBuffer();
    const rawBodyString = new TextDecoder().decode(rawBody);
    
    console.log(`[${requestId}] Processing webhook event`);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBodyString,
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

      // Fetch and verify auction details
      const { data: auction, error: fetchError } = await supabaseClient
        .from('artworks')
        .select('*, profiles!winner_id(*)')
        .eq('id', auctionId)
        .single();

      if (fetchError) {
        console.error(`[${requestId}] Error fetching artwork:`, fetchError);
        throw fetchError;
      }

      if (!auction) {
        throw new Error(`Auction ${auctionId} not found`);
      }

      // Update payment status with transaction details
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

      // Send confirmation emails
      if (auction.profiles?.email) {
        try {
          const emailContent = getEmailContent('payment_confirmation', auction);
          await sendEmail(auction.profiles.email, emailContent);
          console.log(`[${requestId}] Payment confirmation email sent to buyer`);
        } catch (error) {
          console.error(`[${requestId}] Error sending payment confirmation email:`, error);
        }
      }

      // Notify admin users
      try {
        const { data: adminProfiles } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('is_admin', true);

        if (adminProfiles?.length) {
          const { data: { users: adminUsers } } = await supabaseClient.auth.admin.listUsers();
          
          const adminEmails = adminUsers
            .filter(user => adminProfiles.some(profile => profile.id === user.id))
            .map(user => user.email)
            .filter(Boolean);

          if (adminEmails.length > 0) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'VIS Auction <updates@visauction.com>',
                to: adminEmails,
                subject: `Payment Completed - ${auction.title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1a1a1a;">Payment Completed</h1>
                    <p>A payment has been completed for the artwork "${auction.title}".</p>
                    <p>Transaction Details:</p>
                    <ul>
                      <li>Amount: €${auction.current_price?.toLocaleString()}</li>
                      <li>Payment ID: ${session.payment_intent}</li>
                      <li>Buyer ID: ${session.metadata.user_id}</li>
                      <li>Transaction Date: ${new Date().toISOString()}</li>
                    </ul>
                  </div>
                `
              })
            });
            console.log(`[${requestId}] Admin notification emails sent`);
          }
        }
      } catch (error) {
        console.error(`[${requestId}] Error sending admin notifications:`, error);
      }
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