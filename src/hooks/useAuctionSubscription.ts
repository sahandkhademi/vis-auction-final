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
          console.error('❌ No session found');
          return;
        }

        console.log('🔍 Checking win conditions:', {
          winnerId: newData.winner_id,
          userId: session.user.id,
          completionStatus: newData.completion_status,
          paymentStatus: newData.payment_status
        });

        // Only send notification if this user is the winner AND auction is completed
        if (newData.winner_id === session.user.id && newData.completion_status === 'completed') {
          console.log('🎉 Winner match found! Sending win email...');
          
          try {
            console.log('📧 Invoking send-auction-win-email with payload:', {
              email: session.user.email,
              auctionId: id,
              userId: session.user.id
            });

            const { error } = await supabase.functions.invoke('send-auction-win-email', {
              body: { 
                email: session.user.email,
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
          } catch (error) {
            console.error('❌ Error invoking send-auction-win-email:', error);
          }
        } else {
          console.log('ℹ️ Not sending win email - conditions not met:', {
            isWinner: newData.winner_id === session.user.id,
            isCompleted: newData.completion_status === 'completed'
          });
        }
      } catch (error) {
        console.error('❌ Error in handleAuctionWon:', error);
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
      console.log('🔄 Setting up auction updates subscription for:', id);
      
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
            const newData = payload.new as { 
              completion_status: string, 
              winner_id: string, 
              current_price: number,
              payment_status: string,
              end_date: string 
            };
            
            console.log('📊 Auction update details:', {
              completionStatus: newData.completion_status,
              winnerId: newData.winner_id,
              currentPrice: newData.current_price,
              paymentStatus: newData.payment_status,
              endDate: newData.end_date
            });

            if (newData.current_price) {
              setCurrentHighestBid(newData.current_price);
            }
            
            // Handle auction completion and winner notification
            if (newData.completion_status === 'completed') {
              console.log('🏁 Auction completed, processing winner notification');
              await handleAuctionWon(newData);
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