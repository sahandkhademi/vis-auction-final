import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log('🔔 Starting auction completion handler...');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    console.log('📦 Processing auction:', auctionId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auction and winner details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          email,
          username
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

    // Check if winner has email notifications enabled
    const { data: notificationPrefs } = await supabaseClient
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', auction.winner_id)
      .single();

    if (notificationPrefs?.auction_won_notifications !== false) {
      // Call the email sending function
      console.log('📧 Calling send-auction-email function');
      const emailResponse = await supabaseClient.functions.invoke('send-auction-email', {
        body: { 
          auctionId,
          type: 'auction_won',
          recipientEmail: auction.winner.email,
          auctionTitle: auction.title,
          finalPrice: auction.current_price
        }
      });

      if (emailResponse.error) {
        console.error('❌ Error calling send-auction-email:', emailResponse.error);
      } else {
        console.log('✅ Email function called successfully:', emailResponse.data);
      }
    } else {
      console.log('ℹ️ Winner has disabled auction won notifications');
    }

    // Create a notification in the database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: auction.winner_id,
        title: 'Auction Won!',
        message: `Congratulations! You've won the auction for "${auction.title}"`,
        type: 'auction_won'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Auction completion processed and notifications sent',
        emailStatus: emailResponse?.data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in handle-auction-completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});