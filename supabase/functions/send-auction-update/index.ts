import { createClient } from '@supabase/supabase-js';
import { EmailData } from './types';
import { getEmailContent } from './email-templates';
import { sendEmail } from './email-service';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId, auctionId, type, newBidAmount } = await req.json() as EmailData;
    console.log('Processing email notification:', { userId, auctionId, type, newBidAmount });

    // Get the user's email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user?.email) {
      console.error('Error fetching user:', userError);
      throw new Error('User not found or no email available');
    }
    console.log('Found user email:', user.email);

    // Get user's notification preferences
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      throw prefError;
    }
    console.log('User preferences:', preferences);

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('artworks')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('Error fetching auction:', auctionError);
      throw auctionError;
    }
    console.log('Found auction:', auction);

    // Check if notifications are enabled for this type
    let shouldSend = false;
    switch (type) {
      case 'outbid':
        shouldSend = preferences.outbid_notifications;
        break;
      case 'ending_soon':
        shouldSend = preferences.auction_ending_notifications;
        break;
      case 'auction_won':
        shouldSend = preferences.auction_won_notifications;
        break;
    }

    if (!shouldSend) {
      console.log('Notification type disabled by user preferences');
      return new Response(
        JSON.stringify({ message: 'Notification type disabled by user preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auctionUrl = `${new URL(req.url).origin.replace('functions.', '')}/auction/${auctionId}`;
    console.log('Auction URL:', auctionUrl);

    const emailContent = getEmailContent(type, auction, newBidAmount, auctionUrl);
    const response = await sendEmail(user.email, emailContent);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-auction-update function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});