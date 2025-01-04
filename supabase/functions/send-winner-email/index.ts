import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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

    // Get auction and winner details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:winner_id (
          email
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError) throw auctionError
    if (!auction.winner) throw new Error('No winner found for auction')

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Art Auction <onboarding@resend.dev>',
        to: [auction.winner.email],
        subject: 'Congratulations! You Won the Auction!',
        html: `
          <h1>Congratulations!</h1>
          <p>You've won the auction for "${auction.title}"!</p>
          <p>Final price: $${auction.current_price}</p>
          <p>Please complete your payment to claim your artwork.</p>
          <br>
          <p>Thank you for participating in our auction!</p>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    console.log(`Email sent to winner (${auction.winner.email}) for auction ${auctionId}`)

    return new Response(
      JSON.stringify({ message: 'Winner notification email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending winner notification email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})