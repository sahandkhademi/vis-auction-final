import { PaymentButton } from "./PaymentButton";
import { useUser } from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "react-router-dom";

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
  const needsPayment = isWinner && paymentStatus === 'pending' && completionStatus === 'completed';
  const paymentSuccess = searchParams.get('payment_success') === 'true';

  // Fetch the winner's actual winning bid amount
  const { data: winningBid } = useQuery({
    queryKey: ['winningBid', auctionId, winnerId],
    queryFn: async () => {
      if (!winnerId || completionStatus !== 'completed') return null;
      
      const { data, error } = await supabase
        .from('bids')
        .select('amount')
        .eq('auction_id', auctionId)
        .eq('user_id', winnerId)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.amount || currentBid;
    },
    enabled: !!winnerId && completionStatus === 'completed'
  });

  const finalPrice = winningBid || currentBid;

  return (
    <div className="space-y-4">
      {paymentSuccess && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Payment Successful!</AlertTitle>
          <AlertDescription>
            Thank you for your payment! We've received your payment successfully. You'll receive a confirmation email shortly.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-2xl font-bold">€{finalPrice?.toLocaleString()}</p>
        </div>
        <div>
          {completionStatus === 'completed' ? (
            <Badge variant={paymentStatus === 'completed' ? 'default' : 'secondary'}>
              {paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
            </Badge>
          ) : (
            <Badge variant="outline">Ongoing</Badge>
          )}
        </div>
      </div>

      {needsPayment && (
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