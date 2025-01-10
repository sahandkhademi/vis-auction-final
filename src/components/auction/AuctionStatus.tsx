import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionStatusDisplay } from "./AuctionStatusDisplay";
import { PaymentStatus } from "./PaymentStatus";
import { useAuctionCompletion } from "./hooks/useAuctionCompletion";
import { usePaymentStatus } from "./hooks/usePaymentStatus";
import { useEffect, useState } from "react";

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
  const [localCompletionStatus, setLocalCompletionStatus] = useState(completionStatus);
  const [localWinnerId, setLocalWinnerId] = useState(winnerId);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus);
  const isWinner = user?.id === localWinnerId;
  const isEnded = localCompletionStatus === 'completed' || (endDate && new Date(endDate) < new Date());

  console.log('🔍 AuctionStatus Props:', {
    currentBid,
    endDate,
    completionStatus: localCompletionStatus,
    paymentStatus: localPaymentStatus,
    winnerId: localWinnerId,
    userId: user?.id,
    isWinner,
    isEnded,
    auctionId
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
    enabled: isEnded && !localWinnerId
  });

  // Subscribe to auction updates and check completion status
  useEffect(() => {
    if (!auctionId) return;

    console.log('🔄 Setting up auction update subscription');
    
    // Subscribe to artwork updates
    const artworkChannel = supabase
      .channel('artwork-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          console.log('🔄 Received auction update:', payload);
          const newData = payload.new as any;
          
          // Immediately update local state
          setLocalCompletionStatus(newData.completion_status);
          setLocalWinnerId(newData.winner_id);
          setLocalPaymentStatus(newData.payment_status);
          
          console.log('🔄 Updated local state:', {
            completionStatus: newData.completion_status,
            winnerId: newData.winner_id,
            paymentStatus: newData.payment_status
          });
        }
      )
      .subscribe();

    // Check auction status every second
    const checkInterval = setInterval(() => {
      if (endDate) {
        const now = new Date();
        const end = new Date(endDate);
        
        // If we've passed the end time and auction isn't marked as completed
        if (now >= end && localCompletionStatus !== 'completed') {
          console.log('🔄 End time reached, updating completion status');
          setLocalCompletionStatus('completed');
          
          // Trigger completion handler
          supabase.functions.invoke('handle-auction-completion', {
            body: { auctionId }
          }).then(() => {
            console.log('✅ Auction completion handler triggered');
          }).catch(error => {
            console.error('❌ Error triggering completion handler:', error);
          });
        }
      }
    }, 1000);

    // Set up real-time subscription for payment status updates
    const paymentChannel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          console.log('💳 Received payment update:', payload);
          const newData = payload.new as any;
          if (newData.payment_status !== localPaymentStatus) {
            console.log('💳 Updating payment status to:', newData.payment_status);
            setLocalPaymentStatus(newData.payment_status);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up auction update subscription');
      supabase.removeChannel(artworkChannel);
      supabase.removeChannel(paymentChannel);
      clearInterval(checkInterval);
    };
  }, [auctionId, endDate, localCompletionStatus, localPaymentStatus]);

  // If auction has ended but winner not set, check if current user is highest bidder
  const isPotentialWinner = isEnded && !localWinnerId && highestBid?.user_id === user?.id;

  // Use custom hooks for auction completion and payment status
  const handleRefetch = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('payment_status, winner_id, completion_status')
      .eq('id', auctionId)
      .single();

    if (error) {
      console.error('Error refetching auction data:', error);
      return;
    }

    if (data) {
      setLocalCompletionStatus(data.completion_status);
      setLocalWinnerId(data.winner_id);
      setLocalPaymentStatus(data.payment_status);
    }
  };

  useAuctionCompletion(
    isEnded,
    localCompletionStatus,
    auctionId,
    isWinner,
    isPotentialWinner,
    user?.id,
    user?.email,
    highestBid?.user_id,
    handleRefetch
  );

  usePaymentStatus(handleRefetch);

  const hasCompletedPayment = (isWinner || isPotentialWinner) && localPaymentStatus === 'completed';
  const needsPayment = (isWinner || isPotentialWinner) && localPaymentStatus === 'pending';

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
        />
      )}
    </div>
  );
};