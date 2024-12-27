import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { auctionId } = await req.json()

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError) throw auctionError

    // Get winner's notification preferences
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('auction_won_notifications')
      .eq('user_id', auction.winner_id)
      .single()

    if (preferences?.auction_won_notifications) {
      // Create notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: auction.winner_id,
          title: 'Congratulations! You won the auction!',
          message: `You won the auction for "${auction.title}" with a bid of $${auction.current_price}`,
          type: 'auction_won'
        })

      console.log(`Notification sent to user ${auction.winner_id} for auction ${auctionId}`)
    }

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})