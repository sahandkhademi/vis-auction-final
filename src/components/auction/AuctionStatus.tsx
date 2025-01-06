import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionStatusDisplay } from "./AuctionStatusDisplay";
import { PaymentStatus } from "./PaymentStatus";
import { useAuctionCompletion } from "./hooks/useAuctionCompletion";
import { usePaymentStatus } from "./hooks/usePaymentStatus";
import { useEffect } from "react";

interface AuctionStatusProps {
  currentBid: number;
  endDate: string | null;
  completionStatus: string | null;
  paymentStatus: string | null;
  winnerId: string | null;
  auctionId: string;
}

export const AuctionStatus = ({
  currentBid,
  endDate,
  completionStatus,
  paymentStatus,
  winnerId,
  auctionId,
}: AuctionStatusProps) => {
  const user = useUser();
  const isWinner = user?.id === winnerId;
  const isEnded = completionStatus === 'completed' || (endDate && new Date(endDate) < new Date());

  console.log('🔍 AuctionStatus Props:', {
    currentBid,
    endDate,
    completionStatus,
    paymentStatus,
    winnerId,
    userId: user?.id,
    isWinner,
    isEnded,
    auctionId
  });

  // Fetch auction data to get latest payment status
  const { data: auctionData, refetch: refetchAuction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      console.log('🔄 Fetching latest auction data for:', auctionId);
      const { data, error } = await supabase
        .from('artworks')
        .select('payment_status, winner_id, completion_status')
        .eq('id', auctionId)
        .single();

      if (error) {
        console.error('❌ Error fetching auction data:', error);
        throw error;
      }
      console.log('✅ Latest auction data:', data);
      return data;
    },
  });

  // Fetch highest bid to determine potential winner
  const { data: highestBid } = useQuery({
    queryKey: ['highestBid', auctionId],
    queryFn: async () => {
      console.log('🔄 Fetching highest bid for auction:', auctionId);
      const { data, error } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching highest bid:', error);
        throw error;
      }
      console.log('✅ Highest bid data:', data);
      return data;
    },
    enabled: isEnded && !winnerId
  });

  // Subscribe to auction updates
  useEffect(() => {
    if (!auctionId) return;

    console.log('🔄 Setting up auction update subscription');
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${auctionId}`,
        },
        async (payload) => {
          console.log('🔄 Received auction update:', payload);
          await refetchAuction();
        }
      )
      .subscribe();

    // Set up a polling mechanism as a backup
    const pollInterval = setInterval(async () => {
      if (isEnded) {
        console.log('🔄 Polling for auction updates');
        await refetchAuction();
      }
    }, 5000); // Poll every 5 seconds if ended

    return () => {
      console.log('🔄 Cleaning up auction update subscription');
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [auctionId, isEnded]);

  // If auction has ended but winner not set, check if current user is highest bidder
  const isPotentialWinner = isEnded && !winnerId && highestBid?.user_id === user?.id;

  // Use custom hooks for auction completion and payment status
  const handleRefetch = async () => {
    try {
      await refetchAuction();
    } catch (error) {
      console.error('Error refetching auction data:', error);
    }
  };

  useAuctionCompletion(
    isEnded,
    completionStatus,
    auctionId,
    isWinner,
    isPotentialWinner,
    user?.id,
    user?.email,
    highestBid?.user_id,
    handleRefetch
  );

  usePaymentStatus(handleRefetch);

  const currentPaymentStatus = auctionData?.payment_status || paymentStatus;
  const hasCompletedPayment = (isWinner || isPotentialWinner) && currentPaymentStatus === 'completed';
  const needsPayment = (isWinner || isPotentialWinner) && currentPaymentStatus === 'pending';

  return (
    <div className="space-y-4">
      <AuctionStatusDisplay 
        currentBid={currentBid}
        endDate={endDate}
        isEnded={isEnded}
        isWinner={isWinner}
        isPotentialWinner={isPotentialWinner}
      />

      {(hasCompletedPayment || needsPayment) && (
        <PaymentStatus 
          hasCompletedPayment={hasCompletedPayment}
          needsPayment={needsPayment}
          isEnded={isEnded}
          auctionId={auctionId}
          currentBid={currentBid}
        />
      )}
    </div>
  );
};