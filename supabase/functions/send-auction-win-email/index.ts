import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { email, auctionId, userId } = await req.json();
    console.log('📧 Processing auction win email for:', { email, auctionId, userId });

    if (!email || !auctionId || !userId) {
      console.error('❌ Missing required parameters:', { email, auctionId, userId });
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      console.error('❌ Error fetching auction:', auctionError);
      throw new Error('Error fetching auction details');
    }

    // Check notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', userId)
      .single();

    if (preferences?.auction_won_notifications === false) {
      console.log('📧 User has opted out of auction win notifications');
      return new Response(
        JSON.stringify({ message: 'User has opted out of notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Frontend URL for the auction
    const frontendUrl = 'https://preview--vis-auction-final.lovable.app';
    const auctionUrl = `${frontendUrl}/auction/${auctionId}`;

    console.log('🔗 Generated auction URL:', auctionUrl);

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [email],
        subject: 'Congratulations! You Won the Auction',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Congratulations!</h1>
            <p>You've won the auction for "${auction.title}" with a final bid of €${auction.current_price}.</p>
            <p>Please complete your payment within 48 hours to secure your purchase.</p>
            <p><a href="${auctionUrl}" style="display: inline-block; background-color: #C6A07C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Payment</a></p>
            <p>If payment is not received within 48 hours, the auction will be offered to the next highest bidder.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('❌ Resend API error:', errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log('✅ Email sent successfully:', emailResult);

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Auction Won!',
        message: `Congratulations! You won the auction for "${auction.title}". The final price was €${auction.current_price}.`,
        type: 'auction_won'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
      // Don't throw here, as the email was already sent
    }

    return new Response(
      JSON.stringify({ message: 'Auction win email sent successfully' }),
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