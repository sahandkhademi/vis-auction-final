import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Request received`);

  // Handle CORS preflight requests
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

    // Get the raw body as an ArrayBuffer
    const rawBody = await req.arrayBuffer();
    // Convert ArrayBuffer to string
    const rawBodyString = new TextDecoder().decode(rawBody);
    
    console.log('Raw webhook body:', rawBodyString);
    console.log('Stripe signature:', signature);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let event;
    try {
      // Use constructEventAsync with the raw body string
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

        // First, verify the auction exists and get its current status
        const { data: auction, error: fetchError } = await supabaseClient
          .from('artworks')
          .select('completion_status, payment_status, title')
          .eq('id', auctionId)
          .single();

        if (fetchError) {
          console.error('Error fetching artwork:', fetchError);
          throw fetchError;
        }

        if (!auction) {
          throw new Error(`Auction ${auctionId} not found`);
        }

        // Update the payment status
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

        console.log('Payment status updated successfully for auction:', auctionId);

        // Get all admin users
        const { data: adminProfiles, error: adminError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('is_admin', true);

        if (adminError) {
          console.error('Error fetching admin profiles:', adminError);
          throw adminError;
        }

        // Get admin users' emails
        const adminIds = adminProfiles.map(profile => profile.id);
        const { data: { users: adminUsers }, error: usersError } = await supabaseClient.auth.admin.listUsers();
        
        if (usersError) {
          console.error('Error fetching admin users:', usersError);
          throw usersError;
        }

        const adminEmails = adminUsers
          .filter(user => adminIds.includes(user.id))
          .map(user => user.email)
          .filter(Boolean);

        // Send email to admin users
        if (adminEmails.length > 0) {
          const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
          if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not set');
          }

          try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'VIS Auction <updates@visauction.com>',
                to: adminEmails,
                subject: 'Payment Completed for Artwork',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1a1a1a;">Payment Completed</h1>
                    <p>A payment has been completed for the artwork "${auction.title}".</p>
                    <p>The payment status has been updated to "completed" in the system.</p>
                  </div>
                `
              })
            });

            if (!emailResponse.ok) {
              const error = await emailResponse.text();
              console.error('Error sending admin notification email:', error);
            } else {
              console.log('Admin notification emails sent successfully');
            }
          } catch (error) {
            console.error('Error sending admin notification email:', error);
          }
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