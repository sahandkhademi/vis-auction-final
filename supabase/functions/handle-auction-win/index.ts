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

    // Check if a notification already exists for this auction win
    const { data: existingNotification, error: notificationError } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('user_id', auction.winner_id)
      .eq('type', 'auction_won')
      .eq('message', `Congratulations! You won the auction for "${auction.title}" with a bid of $${auction.current_price}`)
      .single()

    if (notificationError && notificationError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw notificationError
    }

    // Only create notification if it doesn't exist
    if (!existingNotification) {
      // Get winner's notification preferences
      const { data: preferences } = await supabaseClient
        .from('notification_preferences')
        .select('auction_won_notifications')
        .eq('user_id', auction.winner_id)
        .single()

      if (preferences?.auction_won_notifications) {
        // Create in-app notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: auction.winner_id,
            title: 'Congratulations! You won the auction!',
            message: `Congratulations! You won the auction for "${auction.title}" with a bid of $${auction.current_price}`,
            type: 'auction_won'
          })

        // Send email notification
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-winner-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ auctionId }),
        })

        console.log(`Notifications sent to user ${auction.winner_id} for auction ${auctionId}`)
      }
    } else {
      console.log(`Notification already exists for auction ${auctionId} win`)
    }

    return new Response(
      JSON.stringify({ message: 'Notifications handled successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})