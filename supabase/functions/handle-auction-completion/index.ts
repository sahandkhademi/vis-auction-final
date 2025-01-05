import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // First, get completed auctions that haven't notified winners yet
    const { data: completedAuctions, error: auctionError } = await supabaseAdmin
      .from('artworks')
      .select('id, title, winner_id')
      .eq('completion_status', 'completed')
      .eq('payment_status', 'pending')
      .is('winner_id', 'not.null');

    if (auctionError) throw auctionError;

    // For each completed auction, check if a notification already exists
    for (const auction of completedAuctions) {
      const { data: existingNotification } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', auction.winner_id)
        .eq('type', 'auction_won')
        .eq('message', `Congratulations! You won the auction for "${auction.title}"`)
        .maybeSingle();

      // Only create notification if one doesn't exist
      if (!existingNotification) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: auction.winner_id,
            title: 'Auction Won!',
            message: `Congratulations! You won the auction for "${auction.title}"`,
            type: 'auction_won'
          });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Auction completion handled successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handle_auction_completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});