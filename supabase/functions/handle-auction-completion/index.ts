import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getAuctionWinTemplate } from './email-templates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    
    if (!auctionId) {
      console.error('❌ No auctionId provided');
      throw new Error('auctionId is required');
    }
    
    console.log('📦 Processing auction:', auctionId);

    const supabaseClient = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auction and highest bid details
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
      console.error('❌ No auction found with ID:', auctionId);
      throw new Error('Auction not found');
    }

    // Get highest bid
    const { data: highestBid, error: bidError } = await supabaseClient
      .from('bids')
      .select('user_id, amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    if (bidError) {
      console.error('❌ Error fetching highest bid:', bidError);
      throw bidError;
    }

    // Get winner's email
    const { data: winner, error: winnerError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', highestBid.user_id)
      .single();

    if (winnerError) {
      console.error('❌ Error fetching winner details:', winnerError);
      throw winnerError;
    }

    // Update auction with winner and completion status
    const { error: updateError } = await supabaseClient
      .from('artworks')
      .update({
        completion_status: 'completed',
        winner_id: highestBid.user_id,
        current_price: highestBid.amount
      })
      .eq('id', auctionId);

    if (updateError) {
      console.error('❌ Error updating auction:', updateError);
      throw updateError;
    }

    // Send winner email notification
    if (RESEND_API_KEY && winner.email) {
      console.log('📧 Sending winner email to:', winner.email);
      
      try {
        const auctionUrl = `${SUPABASE_URL?.replace('.supabase.co', '')}/auction/${auction.id}`;
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'VIS Auction <updates@visauction.com>',
            to: [winner.email],
            subject: 'Congratulations! You Won the Auction!',
            html: getAuctionWinTemplate(auction.title, highestBid.amount, auctionUrl)
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error('❌ Failed to send winner email:', errorData);
          throw new Error(`Failed to send winner email: ${errorData}`);
        }

        console.log('✅ Winner email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending winner email:', emailError);
      }
    }

    console.log('✅ Successfully completed auction:', {
      auctionId,
      winnerId: highestBid.user_id,
      finalPrice: highestBid.amount
    });

    return new Response(
      JSON.stringify({ 
        message: 'Auction completion processed successfully',
        winner: highestBid.user_id,
        finalPrice: highestBid.amount
      }),
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