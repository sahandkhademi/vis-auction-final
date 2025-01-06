import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuctionSubscription = (
  id: string | undefined,
  refetch: () => Promise<any>,
  setCurrentHighestBid: (bid: number | null) => void
) => {
  useEffect(() => {
    if (!id) return;

    const handleAuctionCompletion = async () => {
      console.log('🔔 Calling handle-auction-completion for auction:', id);
      const { data, error } = await supabase.functions.invoke('handle-auction-completion', {
        body: { auctionId: id }
      });

      if (error) {
        console.error('❌ Error calling handle-auction-completion:', error);
        toast.error('Error processing auction completion');
      } else {
        console.log('✅ Auction completion handled successfully:', data);
      }
    };

    const subscribeToNewBids = () => {
      console.log('🔄 Setting up bid subscription for auction:', id);
      
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bids',
            filter: `auction_id=eq.${id}`
          },
          async (payload) => {
            const newBid = payload.new as { amount: number, user_id: string };
            console.log('📈 New bid received:', newBid);
            
            // Update current price in artworks table
            const { error: updateError } = await supabase
              .from('artworks')
              .update({ current_price: newBid.amount })
              .eq('id', id);

            if (updateError) {
              console.error('❌ Error updating artwork price:', updateError);
            }

            setCurrentHighestBid(newBid.amount);
            toast.info(`New bid: €${newBid.amount.toLocaleString()}`);

            try {
              const { error } = await supabase.functions.invoke('send-auction-update', {
                body: {
                  type: 'outbid',
                  userId: newBid.user_id,
                  auctionId: id,
                  newBidAmount: newBid.amount
                }
              });

              if (error) {
                console.error('❌ Error sending outbid notification:', error);
              }
            } catch (error) {
              console.error('❌ Error invoking send-auction-update:', error);
            }
          }
        )
        .subscribe();

      return () => {
        console.log('🔄 Cleaning up bid subscription');
        supabase.removeChannel(channel);
      };
    };

    const subscribeToAuctionUpdates = () => {
      console.log('🔄 Setting up auction updates subscription');
      
      const channel = supabase
        .channel('auction-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'artworks',
            filter: `id=eq.${id}`,
          },
          async (payload) => {
            console.log('🔄 Received auction update:', payload);
            const newData = payload.new as { completion_status: string, winner_id: string, current_price: number };
            
            if (newData.current_price) {
              setCurrentHighestBid(newData.current_price);
            }
            
            if (newData.completion_status === 'completed' && newData.winner_id) {
              await handleAuctionCompletion();
              
              try {
                const { error } = await supabase.functions.invoke('send-auction-update', {
                  body: {
                    type: 'auction_won',
                    userId: newData.winner_id,
                    auctionId: id
                  }
                });

                if (error) {
                  console.error('❌ Error sending winner notification:', error);
                }
              } catch (error) {
                console.error('❌ Error invoking send-auction-update:', error);
              }

              await refetch();
              toast.info("This auction has ended");
            }
          }
        )
        .subscribe();

      return () => {
        console.log('🔄 Cleaning up auction updates subscription');
        supabase.removeChannel(channel);
      };
    };

    const unsubscribeFromBids = subscribeToNewBids();
    const unsubscribeFromUpdates = subscribeToAuctionUpdates();

    return () => {
      unsubscribeFromBids();
      unsubscribeFromUpdates();
    };
  }, [id, refetch, setCurrentHighestBid]);
};