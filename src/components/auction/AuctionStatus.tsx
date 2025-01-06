import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { AuctionStatusDisplay } from "./AuctionStatusDisplay";
import { PaymentStatus } from "./PaymentStatus";

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
  const [searchParams] = useSearchParams();
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

  // If auction has ended but winner not set, check if current user is highest bidder
  const isPotentialWinner = isEnded && !winnerId && highestBid?.user_id === user?.id;

  useEffect(() => {
    const handleAuctionCompletion = async () => {
      if (isEnded && completionStatus === 'ongoing') {
        console.log('🔔 Auction completion check:', {
          isEnded,
          completionStatus,
          auctionId,
          currentTime: new Date(),
          endDate: endDate ? new Date(endDate) : null
        });

        try {
          console.log('🚀 Invoking handle-auction-completion for:', auctionId);
          const { error } = await supabase.functions.invoke('handle-auction-completion', {
            body: { auctionId }
          });

          if (error) {
            console.error('❌ Error completing auction:', error);
            toast.error('Error completing auction');
          } else {
            console.log('✅ Auction completion handled successfully');
            
            // Only send email notification if user is the winner
            if (isWinner || isPotentialWinner || user?.id === highestBid?.user_id) {
              try {
                console.log('📧 Sending win email notification');
                const { error: emailError } = await supabase.functions.invoke('send-auction-win-email', {
                  body: { 
                    auctionId,
                    email: user?.email,
                    userId: user?.id
                  }
                });

                if (emailError) {
                  console.error('❌ Error sending win email:', emailError);
                } else {
                  console.log('✅ Win email sent successfully');
                }
              } catch (emailError) {
                console.error('❌ Error invoking send-auction-win-email:', emailError);
              }
            }
            
            // Refetch auction data to get updated status
            refetchAuction();
          }
        } catch (error) {
          console.error('❌ Error in auction completion:', error);
        }
      }
    };

    handleAuctionCompletion();
  }, [isEnded, completionStatus, auctionId, isWinner, isPotentialWinner, user?.id, highestBid?.user_id, refetchAuction, endDate, user?.email]);

  // Check payment status when URL params change
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      refetchAuction();
      toast.success(
        "Payment successful! You'll receive a confirmation email shortly.",
        { duration: 5000 }
      );
    }
  }, [searchParams, refetchAuction]);

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