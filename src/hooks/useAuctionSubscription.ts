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
          (payload) => {
            const newBid = payload.new as { amount: number };
            setCurrentHighestBid(newBid.amount);
            toast.info(`New bid: €${newBid.amount.toLocaleString()}`);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const subscribeToAuctionUpdates = () => {
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
            const newData = payload.new as { completion_status: string };
            
            if (newData.completion_status === 'completed') {
              await handleAuctionCompletion();
              await refetch();
              toast.info("This auction has ended");
            }
          }
        )
        .subscribe();

      return () => {
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