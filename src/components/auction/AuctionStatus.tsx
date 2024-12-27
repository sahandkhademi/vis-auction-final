import { CountdownTimer } from "./CountdownTimer";

interface AuctionStatusProps {
  currentBid: number;
  endDate: string | null;
}

export const AuctionStatus = ({ currentBid, endDate }: AuctionStatusProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wider text-gray-500">Current Bid</p>
        <p className="text-2xl font-light">
          ${currentBid.toLocaleString()}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wider text-gray-500">Time Remaining</p>
        <CountdownTimer endDate={endDate} />
      </div>
    </div>
  );
};