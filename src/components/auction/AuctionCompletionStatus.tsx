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
      <Badge 
        variant="outline" 
        className="text-neutral-600 border-neutral-300 bg-neutral-50 px-3 py-1 text-xs tracking-wider uppercase"
      >
        In Progress
      </Badge>
    );
  }

  if (status === 'completed') {
    if (isWinner) {
      return (
        <div className="space-y-2">
          <Badge 
            variant="default" 
            className="bg-[#403E43] hover:bg-[#2D2B30] text-white px-3 py-1 text-xs tracking-wider uppercase"
          >
            Won
          </Badge>
          {paymentStatus === 'pending' && (
            <Badge 
              variant="outline" 
              className="border-[#E5DEFF] bg-[#F8F7FF] text-[#6B5ED2] px-3 py-1 text-xs tracking-wider uppercase"
            >
              Awaiting Payment
            </Badge>
          )}
        </div>
      );
    }
    return (
      <Badge 
        variant="outline" 
        className="text-neutral-500 border-neutral-200 bg-neutral-50 px-3 py-1 text-xs tracking-wider uppercase"
      >
        Completed
      </Badge>
    );
  }

  return null;
};