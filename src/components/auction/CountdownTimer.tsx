import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

interface CountdownTimerProps {
  endDate: string | null;
}

export const CountdownTimer = ({ endDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!endDate) {
      setTimeLeft("No end date set");
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diffInSeconds = differenceInSeconds(end, now);

      if (diffInSeconds <= 0) {
        setTimeLeft("Auction ended");
        return;
      }

      const days = Math.floor(diffInSeconds / (24 * 60 * 60));
      const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
      const seconds = diffInSeconds % 60;

      setTimeLeft(
        `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
      Time remaining: {timeLeft}
    </div>
  );
};