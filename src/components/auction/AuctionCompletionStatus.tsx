import { Badge } from "@/components/ui/badge";

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
      <Badge variant="secondary" className="capitalize">
        Auction in progress
      </Badge>
    );
  }

  if (status === 'completed') {
    if (isWinner) {
      return (
        <div className="space-y-2">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            You won! 🎉
          </Badge>
          {paymentStatus === 'pending' && (
            <Badge variant="destructive">
              Payment required
            </Badge>
          )}
        </div>
      );
    }
    return (
      <Badge variant="secondary">
        Auction ended
      </Badge>
    );
  }

  return null;
};