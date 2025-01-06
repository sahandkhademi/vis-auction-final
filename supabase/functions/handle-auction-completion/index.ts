import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

console.log("Hello from handle-auction-completion!")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { auctionId } = await req.json()
    
    if (!auctionId) {
      throw new Error('Auction ID is required')
    }

    console.log('🎯 Processing auction completion for:', auctionId);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          email
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError) {
      console.error('❌ Error fetching auction:', auctionError);
      throw auctionError
    }

    if (!auction) {
      throw new Error('Auction not found')
    }

    // Get highest bid
    const { data: highestBid, error: bidError } = await supabaseClient
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .single()

    if (bidError && bidError.code !== 'PGRST116') {
      console.error('❌ Error fetching highest bid:', bidError);
      throw bidError
    }

    // Update auction status
    const updates = {
      completion_status: 'completed',
      winner_id: highestBid?.user_id || null,
      current_price: highestBid?.amount || auction.starting_price,
    }

    console.log('🔄 Updating auction with:', updates);

    const { error: updateError } = await supabaseClient
      .from('artworks')
      .update(updates)
      .eq('id', auctionId)

    if (updateError) {
      console.error('❌ Error updating auction:', updateError);
      throw updateError
    }

    // Send email to winner if there is one
    if (highestBid?.user_id) {
      console.log('📧 Sending winner email...');
      
      try {
        const { error: emailError } = await supabaseClient.functions.invoke('send-auction-win-email', {
          body: { 
            auctionId,
            userId: highestBid.user_id,
            email: auction.winner?.email
          }
        });

        if (emailError) {
          console.error('❌ Error sending winner email:', emailError);
        } else {
          console.log('✅ Winner email sent successfully');
        }
      } catch (error) {
        console.error('❌ Error invoking send-auction-win-email:', error);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Auction completed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error in handle-auction-completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})