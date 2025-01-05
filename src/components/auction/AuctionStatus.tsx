import { PaymentButton } from "./PaymentButton";
import { useUser } from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CountdownTimer } from "./CountdownTimer";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

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
  const needsPayment = isWinner && paymentStatus === 'pending';
  const hasCompletedPayment = isWinner && paymentStatus === 'completed';
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
    enabled: isEnded && !winnerId // Only fetch if auction ended but winner not set
  });

  // If auction has ended but winner not set, check if current user is highest bidder
  const isPotentialWinner = isEnded && !winnerId && highestBid?.user_id === user?.id;

  // Check payment status on mount and when URL params change
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentSuccess = searchParams.get('payment_success');
      if (paymentSuccess === 'true') {
        // Refetch the auction data to get the latest payment status
        await refetchAuction();
        toast.success(
          "Payment successful! You'll receive a confirmation email shortly.",
          { duration: 5000 }
        );
      }
    };

    checkPaymentStatus();
  }, [searchParams, refetchAuction]);

  // For debugging
  console.log('Debug auction status:', {
    userId: user?.id,
    winnerId,
    isWinner,
    completionStatus,
    paymentStatus,
    isEnded,
    needsPayment,
    isPotentialWinner,
    highestBid,
    currentTime: new Date().toISOString(),
    endDate,
    auctionData,
  });

  return (
    <div className="space-y-4">
      {(hasCompletedPayment || (auctionData?.payment_status === 'completed' && isWinner)) && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Payment Completed!</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your payment! Your purchase has been confirmed. You should have received a confirmation email with further details.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-2xl font-bold">€{currentBid?.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!isEnded && endDate && (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
              <CountdownTimer endDate={endDate} />
            </div>
          )}
          <Badge 
            variant={isEnded ? 'default' : 'outline'}
            className={`${isEnded ? 'bg-blue-500' : ''}`}
          >
            {isEnded ? 'Auction Ended' : 'Ongoing'}
          </Badge>
          {(isWinner || isPotentialWinner) && (
            <Badge 
              variant="default" 
              className="bg-green-500"
            >
              You Won!
            </Badge>
          )}
        </div>
      </div>

      {((isWinner || isPotentialWinner) && isEnded && 
        (paymentStatus === 'pending' && auctionData?.payment_status !== 'completed')) && (
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