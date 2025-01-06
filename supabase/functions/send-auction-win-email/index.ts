import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Starting send-auction-win-email function');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    console.log('📦 Processing auction:', auctionId);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get auction and winner details
    const { data: auction, error: auctionError } = await supabase
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          email,
          id
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      console.error('❌ Error fetching auction:', auctionError);
      throw new Error('Failed to fetch auction details');
    }

    if (!auction.winner?.email) {
      console.error('❌ No winner email found for auction:', auctionId);
      throw new Error('No winner email found');
    }

    console.log('✅ Found auction winner:', auction.winner.email);

    // Check if winner has notifications enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', auction.winner.id)
      .single();

    if (preferences?.auction_won_notifications === false) {
      console.log('ℹ️ Winner has disabled auction won notifications');
      return new Response(
        JSON.stringify({ message: 'Winner has disabled notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: auction.winner.id,
        title: 'Auction Won!',
        message: `Congratulations! You've won the auction for "${auction.title}"`,
        type: 'auction_won'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
    }

    // Prepare and send email
    const auctionUrl = `${new URL(req.url).origin.replace('functions.', '')}/auction/${auctionId}`;
    console.log('📧 Sending email to winner with auction URL:', auctionUrl);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [auction.winner.email],
        subject: 'Congratulations! You Won the Auction! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px;">🎉 You're the Winner!</h1>
            </div>
            
            <p>Congratulations! You've won the auction for "${auction.title}".</p>
            <p style="font-size: 18px; color: #C6A07C; font-weight: bold;">Winning Bid: €${auction.current_price?.toLocaleString()}</p>
            
            <p>Please complete your payment to claim your artwork.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${auctionUrl}" 
                 style="background-color: #C6A07C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Complete Payment
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              <p>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
              you can adjust your notification preferences in your account settings.</p>
            </div>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('❌ Failed to send email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await emailResponse.json();
    console.log('✅ Email sent successfully:', result);

    return new Response(
      JSON.stringify({ message: 'Auction win notification sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in send-auction-win-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});