import { Clock, CheckCircle2, Timer, AlertCircle } from "lucide-react";

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
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Auction in Progress</span>
      </div>
    );
  }

  if (status === 'completed') {
    if (isWinner) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">You Won This Auction!</span>
          </div>
          
          {paymentStatus === 'pending' && (
            <div className="flex items-center gap-2 text-amber-600">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-medium">Payment Required</span>
            </div>
          )}
          
          {paymentStatus === 'completed' && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Payment Completed</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-neutral-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Auction Ended</span>
      </div>
    );
  }

  return null;
};