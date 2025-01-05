import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getEmailTemplates, SampleArtwork } from './email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  console.log('Received request to test email templates');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching admin profiles...');
    const { data: adminProfiles, error: adminError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (adminError) {
      console.error('Error fetching admin profiles:', adminError);
      throw adminError;
    }

    if (!adminProfiles?.length) {
      console.error('No admin profiles found');
      throw new Error('No admin users found');
    }

    console.log(`Found ${adminProfiles.length} admin profiles`);

    const { data: { users: adminUsers }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching admin users:', usersError);
      throw usersError;
    }

    const adminEmails = adminUsers
      .filter(user => adminProfiles.some(profile => profile.id === user.id))
      .map(user => user.email)
      .filter(Boolean);

    if (!adminEmails.length) {
      console.error('No admin emails found');
      throw new Error('No admin emails found');
    }

    console.log(`Found ${adminEmails.length} admin emails:`, adminEmails);

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
          from: 'Mosaic Auctions <onboarding@resend.dev>',
          to: adminEmails.map(email => email.trim()),
          subject: template.subject,
          html: template.html,
          reply_to: 'support@mosaicauctions.com'
        };

        console.log('Sending email with data:', JSON.stringify(emailData, null, 2));

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify(emailData)
        });

        const responseText = await response.text();
        console.log(`Response for ${template.subject}:`, responseText);

        if (!response.ok) {
          throw new Error(`Failed to send email: ${responseText}`);
        }
      } catch (error) {
        console.error(`Error sending template ${template.subject}:`, error);
        throw error;
      }
    }

    console.log('All test emails sent successfully');

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
    console.error('Error in test-email-templates function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});