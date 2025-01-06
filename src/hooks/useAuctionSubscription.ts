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

    const handleAuctionWon = async (newData: any) => {
      console.log('🏆 Processing auction won notification:', {
        newData,
        auctionId: id
      });
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('❌ No session found for auction win handler');
          return;
        }

        console.log('🔍 Checking win conditions:', {
          winnerId: newData.winner_id,
          userId: session.user.id,
          completionStatus: newData.completion_status,
          paymentStatus: newData.payment_status
        });

        // Send notification if this user is the winner
        if (newData.winner_id === session.user.id) {
          console.log('🎉 Winner match found! Sending win email...');
          
          const { error } = await supabase.functions.invoke('send-auction-win-email', {
            body: { 
              auctionId: id,
              userId: session.user.id
            }
          });

          if (error) {
            console.error('❌ Error sending auction won notification:', error);
            toast.error('Error processing auction completion');
          } else {
            console.log('✅ Auction won notification sent successfully');
            toast.success('Congratulations! You won the auction!');
          }
        } else {
          console.log('ℹ️ Not sending win email - conditions not met:', {
            isWinner: newData.winner_id === session.user.id
          });
        }
      } catch (error) {
        console.error('❌ Error in handleAuctionWon:', error);
      }
    };

    console.log('🔄 Setting up auction subscriptions for:', id);

    // Subscribe to auction updates
    const auctionChannel = supabase
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
          const newData = payload.new as { 
            completion_status: string, 
            winner_id: string, 
            current_price: number,
            payment_status: string 
          };
          
          if (newData.current_price) {
            console.log('💰 Updating current bid to:', newData.current_price);
            setCurrentHighestBid(newData.current_price);
          }
          
          // Handle auction completion and winner notification
          await handleAuctionWon(newData);
          await refetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Auction subscription status:', status);
      });

    // Subscribe to new bids
    const bidsChannel = supabase
      .channel('new-bids')
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
      .subscribe((status) => {
        console.log('📡 Bids subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up subscriptions');
      supabase.removeChannel(auctionChannel);
      supabase.removeChannel(bidsChannel);
    };
  }, [id, refetch, setCurrentHighestBid]);
};