import { Clock, CheckCircle2, Trophy } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

interface AuctionStatusDisplayProps {
  currentBid: number;
  endDate: string | null;
  isEnded: boolean;
  isWinner: boolean;
  isPotentialWinner: boolean;
}

export const AuctionStatusDisplay = ({
  currentBid,
  endDate,
  isEnded,
  isWinner,
  isPotentialWinner,
}: AuctionStatusDisplayProps) => {
  return (
    <div className="space-y-4">
      {!isEnded && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Ongoing</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">{isEnded ? "Sold Price" : "Current Price"}</p>
          <p className="text-2xl font-bold">€{currentBid?.toLocaleString()}</p>
        </div>

        {!isEnded && endDate && (
          <div>
            <p className="text-sm text-gray-500">Time Remaining</p>
            <div className="text-2xl font-bold">
              <CountdownTimer endDate={endDate} />
            </div>
          </div>
        )}

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
    </div>
  );
};