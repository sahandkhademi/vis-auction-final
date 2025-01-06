import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log('🎉 Processing auction win email for auction:', auctionId);

    if (!auctionId) {
      throw new Error('No auction ID provided');
    }

    // Initialize Supabase client
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

    // Get auction details with winner information
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          email
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('❌ Error fetching auction:', auctionError);
      throw auctionError;
    }

    if (!auction) {
      console.error('❌ Auction not found:', auctionId);
      throw new Error('Auction not found');
    }

    if (!auction.winner?.email) {
      console.error('❌ Winner email not found for auction:', auctionId);
      throw new Error('Winner email not found');
    }

    // Check notification preferences
    const { data: preferences, error: prefError } = await supabaseClient
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', auction.winner_id)
      .single();

    if (prefError) {
      console.error('❌ Error fetching notification preferences:', prefError);
      // Continue anyway as we want to ensure the winner is notified
    }

    // Only skip if preferences explicitly set to false
    if (preferences?.auction_won_notifications === false) {
      console.log('📧 Winner has opted out of auction win notifications');
      return new Response(JSON.stringify({ message: 'Notification skipped - user opted out' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Create notification in database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: auction.winner_id,
        title: 'Auction Won!',
        message: `Congratulations! You won the auction for ${auction.title}. The final price was €${auction.current_price}.`,
        type: 'auction_won'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
    }

    // Use a hardcoded frontend URL since we can't reliably get it from the request
    const frontendUrl = 'https://art-auction-platform.vercel.app';
    const auctionUrl = `${frontendUrl}/auction/${auctionId}`;
    console.log('📧 Sending email to winner with auction URL:', auctionUrl);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Art Auction Platform <notifications@artauction.com>',
        to: auction.winner.email,
        subject: 'Congratulations! You Won the Auction',
        html: `
          <h1>Congratulations!</h1>
          <p>You've won the auction for "${auction.title}" with a final bid of €${auction.current_price}.</p>
          <p>Please complete your payment within 48 hours to secure your purchase.</p>
          <p><a href="${auctionUrl}">Click here to complete your payment</a></p>
          <p>If payment is not received within 48 hours, the auction will be offered to the next highest bidder.</p>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('❌ Error sending email:', errorData);
      throw new Error('Failed to send email');
    }

    console.log('✅ Auction win email sent successfully');
    return new Response(
      JSON.stringify({ message: 'Auction win email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in send-auction-win-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});