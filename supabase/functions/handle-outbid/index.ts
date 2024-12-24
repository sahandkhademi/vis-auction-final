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

    const { previousBidUserId, auctionId, newBidAmount } = await req.json()

    // Check if the outbid user has notifications enabled
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('outbid_notifications')
      .eq('user_id', previousBidUserId)
      .single()

    if (preferences?.outbid_notifications) {
      // Create the notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: previousBidUserId,
          title: "You have been outbid!",
          message: `Someone has placed a higher bid of $${newBidAmount.toLocaleString()} on an auction you were winning.`,
          type: 'outbid'
        })

      console.log(`Notification sent to user ${previousBidUserId} for auction ${auctionId}`)
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