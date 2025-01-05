import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getEmailTemplates, SampleArtwork } from './email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TEST_EMAIL = 'sahandkhademi@icloud.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate RESEND_API_KEY
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log('Starting to send test emails...');

    // Sample data for testing
    const sampleArtwork: SampleArtwork = {
      title: "Sample Artwork",
      artist: "John Doe",
      current_price: 1000,
      image_url: "https://example.com/image.jpg"
    };

    const templates = getEmailTemplates(sampleArtwork);

    console.log('Sending test emails...');
    // Send all test emails
    for (const template of templates) {
      console.log(`Sending template: ${template.subject}`);
      try {
        const emailData = {
          from: 'VIS Auction <onboarding@resend.dev>',
          to: [TEST_EMAIL],
          subject: template.subject,
          html: template.html,
          reply_to: 'support@visauction.com'
        };

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send email: ${errorText}`);
          throw new Error(`Failed to send email: ${errorText}`);
        }

        const responseData = await response.json();
        console.log(`Response for ${template.subject}:`, responseData);
      } catch (error) {
        console.error(`Error sending template ${template.subject}:`, error);
        throw error;
      }
    }

    console.log('All test emails sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test emails sent successfully', 
        recipients: [TEST_EMAIL]
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error('Error in test-email-templates function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
