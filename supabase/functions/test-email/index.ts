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

    // Get the domain verification status
    const domainResponse = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      }
    });

    const domains = await domainResponse.json();
    const verifiedDomains = domains.data?.filter(d => d.status === 'verified') || [];
    
    // Default to onboarding domain if no verified domains
    const fromEmail = verifiedDomains.length > 0 
      ? `Art Auction <noreply@${verifiedDomains[0].name}>`
      : 'Art Auction <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'Test Email from Art Auction',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Test Email</h1>
            <p>This is a test email from your Art Auction application.</p>
            <p>If you're receiving this, your email configuration is working correctly!</p>
            ${!verifiedDomains.length ? `
              <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Note:</strong> To send emails to any address, please verify a domain at 
                <a href="https://resend.com/domains">Resend Domains</a>.
              </div>
            ` : ''}
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
      JSON.stringify({ 
        message: 'Test email sent successfully',
        fromEmail,
        verifiedDomains: verifiedDomains.map(d => d.name)
      }),
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