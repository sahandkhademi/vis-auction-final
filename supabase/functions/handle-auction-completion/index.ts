import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { auctionId } = await req.json();
    console.log('Processing auction completion for:', auctionId);

    // Get auction details with winner information
    const { data: auction, error: auctionError } = await supabaseClient
      .from('artworks')
      .select(`
        *,
        profiles!winner_id (
          email
        )
      `)
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('Error fetching auction:', auctionError);
      throw auctionError;
    }

    if (!auction) {
      throw new Error('Auction not found');
    }

    console.log('Auction data:', auction);

    // Send email to winner if email exists
    if (auction.profiles?.email) {
      console.log('Sending winner email to:', auction.profiles.email);
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'VIS Auction <updates@visauction.com>',
          to: auction.profiles.email,
          subject: 'Congratulations! You Won the Auction!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a1a1a;">🎉 Congratulations!</h1>
              <p>You've won the auction for "${auction.title}"!</p>
              <p style="font-size: 18px; color: #C6A07C; font-weight: bold;">
                Winning Bid: €${auction.current_price?.toLocaleString()}
              </p>
              <p>Please complete your payment within 48 hours to secure your win.</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auction/${auction.id}"
                 style="display: inline-block; background-color: #C6A07C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Complete Payment
              </a>
              <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
                <small>This email was sent by VIS Auction. You can adjust your notification preferences in your account settings.</small>
              </div>
            </div>
          `
        })
      });

      const emailResult = await emailResponse.json();
      console.log('Email sending result:', emailResult);

      if (!emailResponse.ok) {
        console.error('Failed to send email:', emailResult);
        throw new Error('Failed to send winner email');
      }
    }

    return new Response(
      JSON.stringify({ message: 'Auction completion handled successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handle-auction-completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});