import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  userId: string
  auctionId: string
  type: 'outbid' | 'ending_soon' | 'auction_won'
  newBidAmount?: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, auctionId, type, newBidAmount } = await req.json() as EmailData

    console.log('Processing email notification:', { userId, auctionId, type, newBidAmount })

    // Get the user's email using the admin API
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !user?.email) {
      console.error('Error fetching user:', userError)
      throw new Error('User not found or no email available')
    }

    console.log('Found user email:', user.email)

    // Get user's notification preferences
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefError) {
      console.error('Error fetching preferences:', prefError)
      throw prefError
    }

    console.log('User preferences:', preferences)

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError) {
      console.error('Error fetching auction:', auctionError)
      throw auctionError
    }

    console.log('Found auction:', auction)

    let shouldSend = false
    let emailContent = {
      subject: '',
      html: ''
    }

    const auctionUrl = `${new URL(req.url).origin.replace('functions.', '')}/auction/${auctionId}`
    console.log('Auction URL:', auctionUrl)

    // Construct email content based on notification type
    switch (type) {
      case 'outbid':
        if (preferences.outbid_notifications) {
          shouldSend = true
          emailContent = {
            subject: "You've Been Outbid!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">New Bid Alert</h1>
                <p>Someone has placed a higher bid on "${auction.title}".</p>
                <p style="font-size: 18px; margin: 20px 0;">
                  New Highest Bid: <strong>€${newBidAmount?.toLocaleString()}</strong>
                </p>
                <p>Don't miss out - place a new bid now to stay in the running!</p>
                <div style="margin: 30px 0;">
                  <a href="${auctionUrl}" 
                     style="background-color: #0066cc; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 4px;">
                    View Auction
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  You're receiving this email because you enabled outbid notifications. 
                  You can manage your notification preferences in your account settings.
                </p>
              </div>
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
              <p>Current price: €${auction.current_price?.toLocaleString()}</p>
              <p>Don't miss your chance to win!</p>
            `
          }
        }
        break

      case 'auction_won':
        if (preferences.auction_won_notifications) {
          shouldSend = true
          emailContent = {
            subject: "Congratulations! You've Won the Auction!",
            html: `
              <h1>You're the winner!</h1>
              <p>Congratulations! You've won the auction for "${auction.title}".</p>
              <p>Winning bid: €${auction.current_price?.toLocaleString()}</p>
              <p>Please complete your payment to claim your item.</p>
            `
          }
        }
        break
    }

    if (!shouldSend) {
      console.log('Notification type disabled by user preferences')
      return new Response(
        JSON.stringify({ message: 'Notification type disabled by user preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email using Resend
    try {
      console.log('Attempting to send email to:', user.email)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Art Auction <onboarding@resend.dev>',
          to: [user.email],
          subject: emailContent.subject,
          html: emailContent.html
        })
      })

      const responseText = await response.text()
      console.log('Resend API response:', response.status, responseText)

      if (!response.ok) {
        console.error('Failed to send email:', responseText)
        throw new Error(`Failed to send email: ${responseText}`)
      }

      console.log('Email sent successfully')
      return new Response(
        JSON.stringify({ message: 'Email sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in send-auction-update function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})