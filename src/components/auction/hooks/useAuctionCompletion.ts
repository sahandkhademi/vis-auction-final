import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuctionCompletion = (
  isEnded: boolean,
  completionStatus: string | null,
  auctionId: string,
  isWinner: boolean,
  isPotentialWinner: boolean,
  userId: string | undefined,
  userEmail: string | undefined,
  highestBidUserId: string | undefined,
  refetchAuction: () => Promise<void>
) => {
  useEffect(() => {
    const handleAuctionCompletion = async () => {
      if (isEnded && completionStatus === 'ongoing') {
        console.log('🔔 Starting auction completion process...');

        try {
          console.log('🚀 Invoking handle-auction-completion for:', auctionId);
          const { error } = await supabase.functions.invoke('handle-auction-completion', {
            body: { auctionId }
          });

          if (error) {
            console.error('❌ Error completing auction:', error);
            toast.error('Error completing auction');
            return;
          }

          console.log('✅ Auction completion handled successfully');
          
          if (isWinner || isPotentialWinner || userId === highestBidUserId) {
            try {
              console.log('📧 Sending win email notification');
              await supabase.functions.invoke('send-auction-win-email', {
                body: { 
                  email: userEmail,
                  auctionId,
                  userId
                }
              });
              console.log('✅ Win email sent successfully');
            } catch (emailError) {
              console.error('❌ Error sending win email:', emailError);
            }
          }

          await refetchAuction();
          
        } catch (error) {
          console.error('❌ Error in auction completion:', error);
        }
      }
    };

    handleAuctionCompletion();
  }, [isEnded, completionStatus, auctionId, isWinner, isPotentialWinner, userId, highestBidUserId, refetchAuction, userEmail]);
};