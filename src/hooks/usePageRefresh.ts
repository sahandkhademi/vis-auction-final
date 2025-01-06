import { useEffect } from "react";

export const usePageRefresh = (endDate: string | null, completionStatus: string | null) => {
  useEffect(() => {
    if (!endDate) return;

    const checkAndRefreshPage = () => {
      const now = new Date();
      const end = new Date(endDate);
      
      if (now >= end && completionStatus === 'ongoing') {
        console.log('🔄 Auction ended, refreshing page...');
        // Add a small delay to allow the auction completion to process
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };

    // Check immediately
    checkAndRefreshPage();

    // Set up interval to check every second
    const interval = setInterval(checkAndRefreshPage, 1000);

    return () => clearInterval(interval);
  }, [endDate, completionStatus]);
};