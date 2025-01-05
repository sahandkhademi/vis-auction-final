import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h1>Payment Confirmation</h1>
              <p>Thank you for your payment for "${auction.title}".</p>
              <p>Your transaction has been completed successfully.</p>
              <p>We will be in touch shortly with shipping details.</p>
            </div>
          `
        })
      });
      console.log(`[${session.id}] Payment confirmation email sent to buyer`);
    } catch (error) {
      console.error(`[${session.id}] Error sending payment confirmation email:`, error);
    }
  }
};