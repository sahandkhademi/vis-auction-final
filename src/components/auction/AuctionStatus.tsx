import { CountdownTimer } from "./CountdownTimer";
import { AuctionCompletionStatus } from "./AuctionCompletionStatus";
import { useSession } from "@supabase/auth-helpers-react";

interface AuctionStatusProps {
  currentBid: number;
  endDate: string | null;
  completionStatus?: string;
  paymentStatus?: string;
  winnerId?: string | null;
}

export const AuctionStatus = ({ 
  currentBid, 
  endDate,
  completionStatus = 'ongoing',
  paymentStatus = 'pending',
  winnerId
}: AuctionStatusProps) => {
  const session = useSession();
  const isWinner = session?.user?.id === winnerId;

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
      
      <div className="pt-2">
        <AuctionCompletionStatus 
          status={completionStatus}
          paymentStatus={paymentStatus}
          isWinner={isWinner}
        />
      </div>
    </div>
  );
};