import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { sendEmail } from './email-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('🔔 Starting auction completion handler...');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    console.log('📦 Processing auction:', auctionId);

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

    // Get auction and winner details with email
    const { data: auction, error: auctionError } = await supabaseClient
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

    if (auctionError) {
      console.error('❌ Error fetching auction:', auctionError);
      throw auctionError;
    }

    if (!auction) {
      console.error('❌ No auction found with ID:', auctionId);
      throw new Error('Auction not found');
    }

    console.log('✅ Found auction:', {
      id: auction.id,
      title: auction.title,
      winner: auction.winner,
      status: auction.status,
      completionStatus: auction.completion_status
    });

    // Create notification in the database first
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: auction.winner.id,
        title: 'Auction Won!',
        message: `Congratulations! You've won the auction for "${auction.title}"`,
        type: 'auction_won'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
    } else {
      console.log('✅ Created auction won notification');
    }

    // Check if winner has notifications enabled
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', auction.winner.id)
      .single();

    if (preferences?.auction_won_notifications !== false) {
      // Prepare email content
      const auctionUrl = `${new URL(req.url).origin.replace('functions.', '')}/auction/${auctionId}`;
      
      const emailContent = {
        subject: "Congratulations! You've Won the Auction!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">🎉 You're the Winner!</h1>
            <p>Congratulations! You've won the auction for "${auction.title}".</p>
            <p style="font-size: 18px; color: #C6A07C; font-weight: bold;">Winning Bid: €${auction.current_price?.toLocaleString()}</p>
            <p>Please complete your payment to claim your artwork.</p>
            <div>
              <a href="${auctionUrl}" style="display: inline-block; background-color: #C6A07C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Complete Payment
              </a>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
              you can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `
      };

      // Send email
      try {
        console.log('📧 Sending email to winner:', auction.winner.email);
        await sendEmail(auction.winner.email, emailContent);
        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
      }
    } else {
      console.log('ℹ️ Winner has disabled auction won notifications');
    }

    return new Response(
      JSON.stringify({ message: 'Auction completion processed and notifications sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in handle-auction-completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});