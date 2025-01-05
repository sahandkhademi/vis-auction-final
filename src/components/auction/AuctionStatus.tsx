import { PaymentButton } from "./PaymentButton";
import { useUser } from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";

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
  const needsPayment = isWinner && paymentStatus === 'pending' && completionStatus === 'completed';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-2xl font-bold">€{currentBid?.toLocaleString()}</p>
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
            currentPrice={currentBid}
          />
        </div>
      )}
    </div>
  );
};