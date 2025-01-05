import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface AuctionCompletionStatusProps {
  status: string;
  paymentStatus?: string;
  isWinner?: boolean;
}

export const AuctionCompletionStatus = ({ 
  status, 
  paymentStatus, 
  isWinner 
}: AuctionCompletionStatusProps) => {
  if (status === 'ongoing') {
    return (
      <div className="flex items-center gap-2 text-neutral-600">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">In Progress</span>
      </div>
    );
  }

  if (status === 'completed') {
    if (isWinner) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Auction Won</span>
          </div>
          {paymentStatus === 'pending' && (
            <div className="flex items-center gap-2 text-purple-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Payment Required</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">Auction Ended</span>
      </div>
    );
  }

  return null;
};