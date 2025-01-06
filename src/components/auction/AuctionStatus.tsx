import { PaymentButton } from "./PaymentButton";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CountdownTimer } from "./CountdownTimer";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Clock, CheckCircle2, Trophy } from "lucide-react";

interface AuctionStatusProps {
  currentBid: number;
  endDate: string | null;
  completionStatus: string | null;
  paymentStatus: string | null;
  winnerId: string | null;
  auctionId: string;
}

export const AuctionStatus = ({
  currentBid,
  endDate,
  completionStatus,
  paymentStatus,
  winnerId,
  auctionId,
}: AuctionStatusProps) => {
  const user = useUser();
  const [searchParams] = useSearchParams();
  const isWinner = user?.id === winnerId;
  const isEnded = completionStatus === 'completed' || (endDate && new Date(endDate) < new Date());

  // Fetch auction data to get latest payment status
  const { data: auctionData, refetch: refetchAuction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('payment_status, winner_id')
        .eq('id', auctionId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch highest bid to determine potential winner
  const { data: highestBid } = useQuery({
    queryKey: ['highestBid', auctionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isEnded && !winnerId
  });

  // If auction has ended but winner not set, check if current user is highest bidder
  const isPotentialWinner = isEnded && !winnerId && highestBid?.user_id === user?.id;

  useEffect(() => {
    const handleAuctionCompletion = async () => {
      if (isEnded && !completionStatus) {
        console.log('🔔 Triggering auction completion handler for:', auctionId);
        try {
          const { error } = await supabase.functions.invoke('handle-auction-completion', {
            body: { auctionId }
          });

          if (error) {
            console.error('❌ Error completing auction:', error);
            toast.error('Error completing auction');
          } else {
            console.log('✅ Auction completion handled successfully');
            // Show win notification immediately after successful completion
            if (isWinner || isPotentialWinner || user?.id === highestBid?.user_id) {
              toast.success("Congratulations! You've won the auction!", {
                duration: 5000
              });
            }
            // Refetch auction data to get updated status
            refetchAuction();
          }
        } catch (error) {
          console.error('❌ Error in auction completion:', error);
        }
      }
    };

    handleAuctionCompletion();
  }, [isEnded, completionStatus, auctionId, isWinner, isPotentialWinner, user?.id, highestBid?.user_id, refetchAuction]);

  // Check payment status when URL params change
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      refetchAuction();
      toast.success(
        "Payment successful! You'll receive a confirmation email shortly.",
        { duration: 5000 }
      );
    }
  }, [searchParams, refetchAuction]);

  const currentPaymentStatus = auctionData?.payment_status || paymentStatus;
  const hasCompletedPayment = (isWinner || isPotentialWinner) && currentPaymentStatus === 'completed';
  const needsPayment = (isWinner || isPotentialWinner) && currentPaymentStatus === 'pending';

  return (
    <div className="space-y-4">
      {hasCompletedPayment && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Payment Completed!</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your payment! Your purchase has been confirmed. You should have received a confirmation email with further details.
          </AlertDescription>
        </Alert>
      )}

      {!isEnded && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Ongoing</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{isEnded ? "Sold Price" : "Current Price"}</p>
          <p className="text-2xl font-bold">€{currentBid?.toLocaleString()}</p>
        </div>

        {!isEnded && endDate && (
          <div>
            <p className="text-sm text-gray-500">Time Remaining</p>
            <div className="text-2xl font-bold text-right">
              <CountdownTimer endDate={endDate} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-3">
        {isEnded && (
          <div className="flex items-center gap-2 text-blue-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Auction Ended</span>
          </div>
        )}

        {(isWinner || isPotentialWinner) && (
          <div className="flex items-center gap-2 text-emerald-600">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">You Won!</span>
          </div>
        )}
      </div>

      {needsPayment && isEnded && !hasCompletedPayment && (
        <div className="mt-4">
          <PaymentButton 
            auctionId={auctionId} 
            currentPrice={currentBid}
          />
        </div>
      )}
    </div>
  );
};