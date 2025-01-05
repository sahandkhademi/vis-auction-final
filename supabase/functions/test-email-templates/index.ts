import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getEmailTemplates, SampleArtwork } from './email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

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

    // Initialize Supabase client
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
      return new Response(
        JSON.stringify({ error: 'Failed to fetch admin profiles' }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!adminProfiles?.length) {
      console.error('No admin profiles found');
      return new Response(
        JSON.stringify({ error: 'No admin users found' }),
        { headers: corsHeaders, status: 404 }
      );
    }

    console.log(`Found ${adminProfiles.length} admin profiles`);

    const { data: { users: adminUsers }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching admin users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch admin users' }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const adminEmails = adminUsers
      .filter(user => adminProfiles.some(profile => profile.id === user.id))
      .map(user => user.email)
      .filter(Boolean);

    if (!adminEmails.length) {
      console.error('No admin emails found');
      return new Response(
        JSON.stringify({ error: 'No admin emails found' }),
        { headers: corsHeaders, status: 404 }
      );
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
          to: adminEmails,
          subject: template.subject,
          html: template.html,
          reply_to: 'support@mosaicauctions.com'
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
        recipients: adminEmails 
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