import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log('🔔 Starting auction completion handler...');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auctionId } = await req.json();
    console.log('📦 Processing auction:', auctionId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auction and winner details
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        winner:profiles!artworks_winner_id_fkey (
          email,
          username
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('❌ Error fetching auction:', auctionError);
      throw auctionError;
    }

    if (!auction) {
      console.error('❌ No auction found with ID:', auctionId);
      throw new Error('Auction not found');
    }

    console.log('✅ Found auction:', {
      id: auction.id,
      title: auction.title,
      winner: auction.winner,
      status: auction.status,
      completionStatus: auction.completion_status
    });

    if (!auction.winner?.email) {
      console.error('❌ No winner email found for auction:', auctionId);
      throw new Error('No winner email found');
    }

    // Send email using Resend
    console.log('📧 Attempting to send winner email to:', auction.winner.email);
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [auction.winner.email],
        subject: 'Congratulations! You Won the Auction!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a;">🎉 Congratulations!</h1>
            <p>You've won the auction for "${auction.title}"!</p>
            <p style="font-size: 18px; color: #C6A07C; font-weight: bold;">
              Final price: €${auction.current_price?.toLocaleString()}
            </p>
            <p>Please complete your payment within 48 hours to secure your win.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auction/${auction.id}"
               style="display: inline-block; background-color: #C6A07C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Complete Payment
            </a>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
              you can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('📧 Email API Response:', {
      status: emailResponse.status,
      result: emailResult
    });

    if (!emailResponse.ok) {
      console.error('❌ Failed to send email:', emailResult);
      throw new Error(`Failed to send winner email: ${JSON.stringify(emailResult)}`);
    }

    console.log('✅ Winner notification email sent successfully');

    return new Response(
      JSON.stringify({ message: 'Winner notification email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in handle-auction-completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});