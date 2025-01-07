import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getPaymentConfirmationTemplate } from '../../../src/utils/email-templates.ts';

export const sendNotifications = async (auctionId: string, session: any) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Fetch auction details with buyer information
  const { data: auction, error: fetchError } = await supabaseClient
    .from('artworks')
    .select(`
      *,
      profiles!winner_id(
        id,
        email,
        username
      )
    `)
    .eq('id', auctionId)
    .single();

  if (fetchError) {
    console.error(`[${session.id}] Error fetching artwork:`, fetchError);
    throw fetchError;
  }

  if (!auction) {
    throw new Error(`Auction ${auctionId} not found`);
  }

  const auctionUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auction/${auction.id}`;

  // Send confirmation emails
  if (auction.profiles?.email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'VIS Auction <updates@visauction.com>',
          to: auction.profiles.email,
          subject: 'Payment Confirmation - VIS Auction',
          html: getPaymentConfirmationTemplate(auction.title, auction.current_price, auctionUrl)
        })
      });
      console.log(`[${session.id}] Payment confirmation email sent to buyer`);
    } catch (error) {
      console.error(`[${session.id}] Error sending payment confirmation email:`, error);
    }
  }
};