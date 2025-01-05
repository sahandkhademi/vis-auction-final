import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Payment webhook received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const rawBody = await req.arrayBuffer();
    const rawBodyString = new TextDecoder().decode(rawBody);
    
    console.log('Raw webhook body:', rawBodyString);
    console.log('Stripe signature:', signature);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBodyString,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error('Error constructing webhook event:', err);
      return new Response(
        JSON.stringify({ error: err.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Webhook event type:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', session.id);

      if (session.metadata?.auction_id) {
        const auctionId = session.metadata.auction_id;
        console.log('Updating payment status for auction:', auctionId);

        // Fetch auction details with buyer information
        const { data: auction, error: fetchError } = await supabaseClient
          .from('artworks')
          .select(`
            *,
            profiles!winner_id(
              id,
              email,
              username
            )
          `)
          .eq('id', auctionId)
          .single();

        if (fetchError) {
          console.error('Error fetching artwork:', fetchError);
          throw fetchError;
        }

        if (!auction) {
          throw new Error(`Auction ${auctionId} not found`);
        }

        // Update payment status
        const { error: updateError } = await supabaseClient
          .from('artworks')
          .update({ 
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);

        if (updateError) {
          console.error('Error updating artwork payment status:', updateError);
          throw updateError;
        }

        console.log('Payment status updated successfully');

        // Send confirmation email
        if (auction.profiles?.email) {
          try {
            console.log('Sending payment confirmation email to:', auction.profiles.email);
            
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'VIS Auction <updates@visauction.com>',
                to: [auction.profiles.email],
                subject: 'Payment Confirmation - VIS Auction',
                html: `
                  <div style="font-family: Arial, sans-serif;">
                    <h1>Payment Confirmation</h1>
                    <p>Thank you for your payment for "${auction.title}".</p>
                    <p>Your transaction has been completed successfully.</p>
                    <p>We will be in touch shortly with shipping details.</p>
                  </div>
                `
              })
            });

            const emailResult = await emailResponse.json();
            console.log('Email API Response:', {
              status: emailResponse.status,
              result: emailResult
            });

            if (!emailResponse.ok) {
              console.error('Failed to send confirmation email:', emailResult);
            } else {
              console.log('Payment confirmation email sent successfully');
            }
          } catch (error) {
            console.error('Error sending payment confirmation email:', error);
          }
        } else {
          console.error('No email found for winner:', auction.profiles);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});