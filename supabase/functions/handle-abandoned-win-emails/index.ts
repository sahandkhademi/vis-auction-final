import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { getAbandonedWinTemplate } from '../../../src/utils/email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { auctionId, newWinnerId, previousWinnerId } = await req.json()

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError) throw auctionError

    // Get users' notification preferences and email addresses
    const { data: users, error: usersError } = await supabaseClient
      .from('auth.users')
      .select('email')
      .in('id', [newWinnerId, previousWinnerId])

    if (usersError) throw usersError

    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('notification_preferences')
      .select('user_id, auction_won_notifications')
      .in('user_id', [newWinnerId, previousWinnerId])

    if (preferencesError) throw preferencesError

    const auctionUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auction/${auction.id}`

    // Send emails to users who have notifications enabled
    for (const user of users) {
      const userPrefs = preferences.find(p => p.user_id === user.id)
      if (!userPrefs?.auction_won_notifications) continue

      const isNewWinner = user.id === newWinnerId
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'VIS Auction <updates@visauction.com>',
          to: [user.email],
          subject: isNewWinner ? "You're the New Winner!" : "Auction Win Expired",
          html: getAbandonedWinTemplate(auction.title, auction.current_price, isNewWinner, auctionUrl)
        }),
      })
    }

    return new Response(
      JSON.stringify({ message: 'Notifications sent successfully' }),
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