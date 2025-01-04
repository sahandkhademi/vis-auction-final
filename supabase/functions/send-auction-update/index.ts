import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  userId: string;
  auctionId: string;
  type: 'outbid' | 'ending_soon' | 'won';
  newBidAmount?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, auctionId, type, newBidAmount } = await req.json() as EmailData

    // Get user's email and notification preferences
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    const { data: preferences, error: prefError } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefError) throw prefError

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError) throw auctionError

    // Check if user wants this type of notification
    let shouldSend = false
    let emailContent = {
      subject: '',
      html: ''
    }

    switch (type) {
      case 'outbid':
        if (preferences.outbid_notifications) {
          shouldSend = true
          emailContent = {
            subject: "You Have Been Outbid!",
            html: `
              <h1>Someone has placed a higher bid</h1>
              <p>A new bid of €${newBidAmount?.toLocaleString()} has been placed on "${auction.title}".</p>
              <p>Don't miss out - place a new bid now!</p>
            `
          }
        }
        break
      
      case 'ending_soon':
        if (preferences.auction_ending_notifications) {
          shouldSend = true
          emailContent = {
            subject: "Auction Ending Soon!",
            html: `
              <h1>Time is running out!</h1>
              <p>The auction for "${auction.title}" is ending soon.</p>
              <p>Current bid: €${auction.current_price?.toLocaleString()}</p>
              <p>Don't miss your chance to win this piece!</p>
            `
          }
        }
        break
      
      case 'won':
        if (preferences.auction_won_notifications) {
          shouldSend = true
          emailContent = {
            subject: "Congratulations! You Won the Auction!",
            html: `
              <h1>You have won!</h1>
              <p>Congratulations! You have won the auction for "${auction.title}" with a bid of €${auction.current_price?.toLocaleString()}.</p>
              <p>Please complete your payment to claim your artwork.</p>
            `
          }
        }
        break
    }

    if (shouldSend && userData.email) {
      console.log(`Sending ${type} email to ${userData.email}`);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Mosaic Auctions <onboarding@resend.dev>',
          to: [userData.email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      console.log(`Email sent successfully to ${userData.email} for ${type} notification`)
    }

    return new Response(
      JSON.stringify({ message: 'Notification processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})