import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
                  <a href="${SUPABASE_URL}/auction/${auctionId}" 
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

    if (shouldSend && user.email) {
      console.log(`Sending ${type} email to ${user.email}`)
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Mosaic Auctions <onboarding@resend.dev>',
          to: [user.email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to send email:', errorText)
        throw new Error('Failed to send email')
      }

      console.log(`Email sent successfully to ${user.email} for ${type} notification`)
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
