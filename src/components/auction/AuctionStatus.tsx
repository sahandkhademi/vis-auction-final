import { PaymentButton } from "./PaymentButton";
import { useUser } from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CountdownTimer } from "./CountdownTimer";

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
  const isWinner = user?.id === winnerId;
  const needsPayment = isWinner && paymentStatus === 'pending';
  const hasCompletedPayment = isWinner && paymentStatus === 'completed';
  const isEnded = completionStatus === 'completed' || (endDate && new Date(endDate) < new Date());

  // Fetch the winner's actual winning bid amount
  const { data: winningBid } = useQuery({
    queryKey: ['winningBid', auctionId, winnerId],
    queryFn: async () => {
      if (!winnerId) return null;
      
      const { data, error } = await supabase
        .from('bids')
        .select('amount')
        .eq('auction_id', auctionId)
        .eq('user_id', winnerId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.amount || currentBid;
    },
    enabled: !!winnerId
  });

  const finalPrice = winningBid || currentBid;

  console.log('Debug payment button:', {
    isWinner,
    needsPayment,
    isEnded,
    completionStatus,
    paymentStatus,
    winnerId,
    userId: user?.id
  });

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

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-2xl font-bold">€{finalPrice?.toLocaleString()}</p>
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
          {isWinner && (
            <Badge 
              variant="default" 
              className="bg-green-500"
            >
              You Won!
            </Badge>
          )}
        </div>
      </div>

      {needsPayment && isEnded && (
        <div className="mt-4">
          <PaymentButton 
            auctionId={auctionId} 
            currentPrice={finalPrice}
          />
        </div>
      )}
    </div>
  );
};