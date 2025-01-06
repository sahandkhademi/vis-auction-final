import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
      .select('*')
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

    if (bidError && bidError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('❌ Error fetching highest bid:', bidError);
      throw bidError;
    }

    if (highestBid) {
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

      // Send email notification
      try {
        console.log('📧 Sending win email notification');
        const { error: emailError } = await supabaseClient.functions.invoke('send-auction-win-email', {
          body: { 
            auctionId,
            userId: highestBid.user_id
          }
        });

        if (emailError) {
          console.error('❌ Error sending win email:', emailError);
        } else {
          console.log('✅ Win email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Error invoking send-auction-win-email:', emailError);
      }
    }

    console.log('✅ Successfully completed auction:', {
      auctionId,
      winnerId: highestBid?.user_id,
      finalPrice: highestBid?.amount
    });

    return new Response(
      JSON.stringify({ 
        message: 'Auction completion processed successfully',
        winner: highestBid?.user_id,
        finalPrice: highestBid?.amount
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