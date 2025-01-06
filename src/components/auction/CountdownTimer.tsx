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

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return <>{timeLeft}</>;
};