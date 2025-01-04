import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('Email service is not configured properly. Please set RESEND_API_KEY.')
    }

    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email address is required')
    }

    console.log('Attempting to send test email to:', email)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Art Auction <onboarding@resend.dev>',
        to: [email],
        subject: 'Test Email from Art Auction',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Test Email</h1>
            <p>This is a test email from your Art Auction application.</p>
            <p>If you're receiving this, your email configuration is working correctly!</p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      })
    })

    const responseData = await response.text()
    console.log('Resend API response:', response.status, responseData)

    if (!response.ok) {
      throw new Error(`Failed to send email: ${responseData}`)
    }

    return new Response(
      JSON.stringify({ message: 'Test email sent successfully' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error sending test email:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the Edge Function logs for more details'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})