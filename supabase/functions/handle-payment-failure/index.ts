import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getPaymentFailureTemplate } from './email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId, userId } = await req.json();
    console.log('🔄 Processing payment failure for auction:', auctionId, 'user:', userId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          id,
          email
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      console.error('❌ Error fetching auction:', auctionError);
      throw new Error('Auction not found');
    }

    if (!auction.winner?.email) {
      console.error('❌ Winner email not found');
      throw new Error('Winner email not found');
    }

    // Update payment status to failed
    const { error: updateError } = await supabaseClient
      .from('artworks')
      .update({ payment_status: 'failed' })
      .eq('id', auctionId);

    if (updateError) {
      console.error('❌ Error updating payment status:', updateError);
      throw updateError;
    }

    const auctionUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auction/${auction.id}`;

    // Send email notification
    console.log('📧 Sending email to:', auction.winner.email);
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [auction.winner.email],
        subject: 'Action Required: Payment Processing Failed',
        html: getPaymentFailureTemplate(auction.title, auction.current_price, auctionUrl)
      })
    });

    if (!emailResponse.ok) {
      console.error('❌ Failed to send email:', await emailResponse.text());
    } else {
      console.log('✅ Email sent successfully');
    }

    // Create in-app notification
    console.log('🔔 Creating in-app notification for user:', userId);
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Payment Processing Failed',
        message: `We were unable to process your payment for "${auction.title}". Please complete your payment manually.`,
        type: 'payment_failed'
      });

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
    } else {
      console.log('✅ Notification created successfully');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});