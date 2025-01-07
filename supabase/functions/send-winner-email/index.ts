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
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { auctionId } = await req.json()
    console.log('Processing winner email for auction:', auctionId);

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

    if (auctionError) {
      console.error('Error fetching auction:', auctionError);
      throw auctionError;
    }
    if (!auction.winner) {
      console.error('No winner found for auction:', auctionId);
      throw new Error('No winner found for auction');
    }

    console.log('Sending winner email to:', auction.winner.email);

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [auction.winner.email],
        subject: 'Congratulations! You Won the Auction!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Congratulations!</h1>
            <p>You've won the auction for "${auction.title}"!</p>
            <p>Final price: €${auction.current_price?.toLocaleString()}</p>
            <p>Please complete your payment to claim your artwork.</p>
            <br>
            <p>Thank you for participating in our auction!</p>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. You can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

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