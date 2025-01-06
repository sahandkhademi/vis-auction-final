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
  refetchAuction: () => Promise<void>
) => {
  useEffect(() => {
    let isProcessing = false;

    const handleAuctionCompletion = async () => {
      if (isProcessing || !isEnded || completionStatus !== 'ongoing' || !auctionId) {
        return;
      }

      try {
        isProcessing = true;
        console.log('🔔 Starting auction completion process for:', auctionId);

        const { error } = await supabase.functions.invoke('handle-auction-completion', {
          body: { auctionId }
        });

        if (error) {
          console.error('❌ Error completing auction:', error);
          toast.error('Error completing auction');
          return;
        }

        console.log('✅ Auction completion handled successfully');
        
        // Only send email notification if user is the winner
        if (isWinner || isPotentialWinner || userId) {
          try {
            console.log('📧 Sending win email notification');
            const { error: emailError } = await supabase.functions.invoke('send-auction-win-email', {
              body: { 
                auctionId,
                email: userEmail,
                userId
              }
            });

            if (emailError) {
              console.error('❌ Error sending win email:', emailError);
            } else {
              console.log('✅ Win email sent successfully');
            }
          } catch (emailError) {
            console.error('❌ Error invoking send-auction-win-email:', emailError);
          }
        }
        
        await refetchAuction();
      } catch (error) {
        console.error('❌ Error in auction completion:', error);
      } finally {
        isProcessing = false;
      }
    };

    handleAuctionCompletion();
  }, [isEnded, completionStatus, auctionId, isWinner, isPotentialWinner, userId, userEmail, refetchAuction]);
};