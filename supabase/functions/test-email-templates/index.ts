import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all admin users
    const { data: adminProfiles } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (!adminProfiles?.length) {
      throw new Error('No admin users found');
    }

    // Get admin users' emails
    const { data: { users: adminUsers } } = await supabaseClient.auth.admin.listUsers();
    
    const adminEmails = adminUsers
      .filter(user => adminProfiles.some(profile => profile.id === user.id))
      .map(user => user.email)
      .filter(Boolean);

    if (!adminEmails.length) {
      throw new Error('No admin emails found');
    }

    // Sample data for testing
    const sampleArtwork = {
      title: "Sample Artwork",
      artist: "John Doe",
      current_price: 1000,
      image_url: "https://example.com/image.jpg"
    };

    // Test templates
    const templates = [
      {
        subject: "[Test] Outbid Notification",
        html: `
          <div style="${getBaseEmailStyle()}">
            <h1 style="${getHeadingStyle()}">New Bid Alert</h1>
            <p>Someone has placed a higher bid on "${sampleArtwork.title}".</p>
            <p style="${getPriceStyle()}">New Highest Bid: €1,200</p>
            <p>Don't miss out - place a new bid now to stay in the running!</p>
            <a href="#" style="${getButtonStyle()}">View Auction</a>
            <div style="${getFooterStyle()}">
              <small>This is a test email from VIS Auction.</small>
            </div>
          </div>
        `
      },
      {
        subject: "[Test] Auction Ending Soon",
        html: `
          <div style="${getBaseEmailStyle()}">
            <h1 style="${getHeadingStyle()}">Time is Running Out!</h1>
            <p>The auction for "${sampleArtwork.title}" is ending soon.</p>
            <p style="${getPriceStyle()}">Current Price: €${sampleArtwork.current_price.toLocaleString()}</p>
            <p>Don't miss your chance to win this exceptional piece!</p>
            <a href="#" style="${getButtonStyle()}">Place Your Bid Now</a>
            <div style="${getFooterStyle()}">
              <small>This is a test email from VIS Auction.</small>
            </div>
          </div>
        `
      },
      {
        subject: "[Test] Auction Won",
        html: `
          <div style="${getBaseEmailStyle()}">
            <h1 style="${getHeadingStyle()}">🎉 You're the Winner!</h1>
            <p>Congratulations! You've won the auction for "${sampleArtwork.title}".</p>
            <p style="${getPriceStyle()}">Winning Bid: €${sampleArtwork.current_price.toLocaleString()}</p>
            <p>Please complete your payment to claim your artwork.</p>
            <a href="#" style="${getButtonStyle()}">Complete Payment</a>
            <div style="${getFooterStyle()}">
              <small>This is a test email from VIS Auction.</small>
            </div>
          </div>
        `
      },
      {
        subject: "[Test] Payment Confirmation",
        html: `
          <div style="${getBaseEmailStyle()}">
            <h1 style="${getHeadingStyle()}">🎉 Payment Confirmed!</h1>
            <p>Thank you for your payment. Here's your purchase confirmation for "${sampleArtwork.title}".</p>
            <table style="${getTableStyle()}">
              <tr>
                <td style="${getTdStyle()}">Artwork</td>
                <td style="${getTdStyle()}">${sampleArtwork.title}</td>
              </tr>
              <tr>
                <td style="${getTdStyle()}">Artist</td>
                <td style="${getTdStyle()}">${sampleArtwork.artist}</td>
              </tr>
              <tr>
                <td style="${getTdStyle()}">Amount Paid</td>
                <td style="${getTdStyle()}" style="${getPriceStyle()}">€${sampleArtwork.current_price.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="${getTdStyle()}">Date</td>
                <td style="${getTdStyle()}">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            <div style="${getFooterStyle()}">
              <small>This is a test email from VIS Auction. Please keep this email for your records.</small>
            </div>
          </div>
        `
      }
    ];

    // Send all test emails
    const emailPromises = templates.map(template => 
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'VIS Auction <onboarding@resend.dev>',
          to: adminEmails,
          subject: template.subject,
          html: template.html
        })
      })
    );

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: 'Test emails sent successfully', 
        recipients: adminEmails 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending test emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});