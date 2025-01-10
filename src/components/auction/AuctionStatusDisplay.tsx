import { Clock, CheckCircle2, Trophy, BadgeCheck } from "lucide-react";
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

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{isEnded ? "Sold Price" : "Current Price"}</p>
          <p className="text-2xl font-bold">€{currentBid?.toLocaleString()}</p>
        </div>

        {!isEnded && endDate && (
          <div>
            <p className="text-sm text-gray-500">Time Remaining</p>
            <div className="text-2xl font-bold text-right">
              <CountdownTimer endDate={endDate} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-3">
        {isEnded && (
          <div className="flex items-center gap-2 text-blue-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Auction Ended</span>
          </div>
        )}

        {(isWinner || isPotentialWinner) && (
          <>
            <div className="flex items-center gap-2 text-emerald-600">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">You Won!</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Thank you for your purchase!</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};