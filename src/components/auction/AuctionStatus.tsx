import { CountdownTimer } from "./CountdownTimer";
import { AuctionCompletionStatus } from "./AuctionCompletionStatus";
import { PaymentButton } from "./PaymentButton";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuctionStatusProps {
  currentBid: number;
  endDate: string | null;
  completionStatus?: string;
  paymentStatus?: string;
  winnerId?: string | null;
  auctionId: string;
}

export const AuctionStatus = ({ 
  currentBid, 
  endDate,
  completionStatus = 'ongoing',
  paymentStatus = 'pending',
  winnerId,
  auctionId
}: AuctionStatusProps) => {
  const session = useSession();
  const isWinner = session?.user?.id === winnerId;
  const showPaymentButton = isWinner && 
    completionStatus === 'completed' && 
    paymentStatus === 'pending';

  useEffect(() => {
    if (endDate) {
      const endDateTime = new Date(endDate).getTime();
      const now = new Date().getTime();
      const timeRemaining = endDateTime - now;
      
      // If less than 1 hour remaining, send notification
      if (timeRemaining > 0 && timeRemaining <= 3600000) {
        const notifyEndingSoon = async () => {
          const { data: bids } = await supabase
            .from('bids')
            .select('user_id')
            .eq('auction_id', auctionId)
            .order('created_at', { ascending: false });

          // Notify all unique bidders
          const uniqueBidders = [...new Set(bids?.map(bid => bid.user_id))];
          
          for (const userId of uniqueBidders) {
            await supabase.functions.invoke('send-auction-update', {
              body: {
                userId,
                auctionId,
                type: 'ending_soon'
              }
            });
          }
        };

        notifyEndingSoon();
      }
    }
  }, [endDate, auctionId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wider text-gray-500">Current Bid</p>
          <p className="text-2xl font-light">
            €{currentBid.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wider text-gray-500">Time Remaining</p>
          <CountdownTimer endDate={endDate} />
        </div>
      </div>
      
      <div className="pt-2 space-y-4">
        <AuctionCompletionStatus 
          status={completionStatus}
          paymentStatus={paymentStatus}
          isWinner={isWinner}
        />
        
        {showPaymentButton && (
          <PaymentButton auctionId={auctionId} />
        )}
      </div>
    </div>
  );
};