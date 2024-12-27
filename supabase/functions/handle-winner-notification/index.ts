import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get completed auctions that haven't notified winners yet
    const { data: completedAuctions, error: auctionsError } = await supabaseClient
      .from('artworks')
      .select('id, title, winner_id')
      .eq('completion_status', 'completed')
      .eq('payment_status', 'pending')
      .is('winner_id', 'not.null')

    if (auctionsError) throw auctionsError

    // Create notifications for winners
    for (const auction of completedAuctions) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: auction.winner_id,
          title: 'Auction Won! 🎉',
          message: `Congratulations! You've won the auction for "${auction.title}". Please complete your payment to claim your artwork.`,
          type: 'auction_won'
        })

      if (notificationError) throw notificationError
    }

    return new Response(
      JSON.stringify({ message: 'Winner notifications sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})