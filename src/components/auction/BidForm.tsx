import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  onBidPlaced: () => void;
  isLoading?: boolean;
  completionStatus?: string;
  endDate?: string | null;
}

export const BidForm = ({ 
  auctionId, 
  currentBid, 
  onBidPlaced,
  isLoading = false,
  completionStatus,
  endDate
}: BidFormProps) => {
  const [bidAmount, setBidAmount] = useState<number>(currentBid + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [hasValidPaymentMethod, setHasValidPaymentMethod] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setBidAmount(currentBid + 1);
  }, [currentBid]);

  useEffect(() => {
    const checkPaymentMethod = async () => {
      if (!session?.user) {
        setHasValidPaymentMethod(false);
        setIsCheckingPayment(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_valid', true)
          .limit(1)
          .single();

        setHasValidPaymentMethod(!!data);
      } catch (error) {
        console.error('Error checking payment method:', error);
        setHasValidPaymentMethod(false);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    checkPaymentMethod();
  }, [session?.user]);

  // Check if auction has ended
  useEffect(() => {
    const checkAuctionStatus = () => {
      const isCompleted = completionStatus === 'completed';
      const isPastEndDate = endDate && new Date(endDate) < new Date();
      setIsAuctionEnded(isCompleted || isPastEndDate);
    };

    checkAuctionStatus();
    const interval = setInterval(checkAuctionStatus, 1000);
    return () => clearInterval(interval);
  }, [completionStatus, endDate]);

  // Subscribe to auction updates
  useEffect(() => {
    if (!auctionId) return;

    const channel = supabase
      .channel('auction-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.completion_status === 'completed') {
            setIsAuctionEnded(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  const notifyPreviousBidder = async (previousBidUserId: string) => {
    try {
      // Send in-app notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: previousBidUserId,
          title: 'You have been outbid!',
          message: `Someone has placed a higher bid of €${bidAmount.toLocaleString()} on an auction you were winning.`,
          type: 'outbid'
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        return;
      }

      // Get the auction details for the email
      const { data: auction, error: auctionError } = await supabase
        .from('artworks')
        .select('title')
        .eq('id', auctionId)
        .single();

      if (auctionError) {
        console.error('Error fetching auction details:', auctionError);
        return;
      }

      // Send email notification via edge function
      const { error: emailError } = await supabase.functions.invoke('send-auction-update', {
        body: {
          userId: previousBidUserId,
          auctionId,
          type: 'outbid',
          newBidAmount: bidAmount,
          auctionTitle: auction.title
        }
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    } catch (error) {
      console.error('Error in notifyPreviousBidder:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAuctionEnded) {
      toast.error("This auction has ended");
      return;
    }

    if (!session?.user?.id) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    if (!hasValidPaymentMethod) {
      toast.error("Please add a valid payment method before bidding");
      navigate("/profile");
      return;
    }

    if (bidAmount <= currentBid) {
      toast.error("Your bid must be higher than the current bid");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current highest bid's user
      const { data: previousBid } = await supabase
        .from('bids')
        .select('user_id')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Insert the new bid
      const { data: bidData, error: bidError } = await supabase
        .from("bids")
        .insert({
          auction_id: auctionId,
          amount: bidAmount,
          user_id: session.user.id
        })
        .select()
        .single();

      if (bidError) {
        console.error("Bid insertion error:", bidError);
        toast({
          title: "Failed to place bid",
          description: bidError.message || "Please try again",
          variant: "destructive",
        });
        return;
      }

      // Update the artwork's current price with the new bid amount
      const { error: updateError } = await supabase
        .from("artworks")
        .update({ current_price: bidAmount })
        .eq("id", auctionId);

      if (updateError) {
        console.error("Artwork update error:", updateError);
        toast({
          title: "Bid placed but price not updated",
          description: "Please refresh the page",
          variant: "destructive",
        });
        return;
      }

      // Notify previous highest bidder if they exist and it's not the same user
      if (previousBid && previousBid.user_id !== session.user.id) {
        await notifyPreviousBidder(previousBid.user_id);
      }

      toast({
        title: "Bid placed successfully!",
        description: `Your bid of €${bidAmount.toLocaleString()} has been placed`,
      });

      onBidPlaced();
      setBidAmount(bidAmount + 1);
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast.error(error.message || "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuctionEnded) {
    return null;
  }

  if (isCheckingPayment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {!hasValidPaymentMethod && session?.user && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Method Required</AlertTitle>
          <AlertDescription>
            Please add a valid payment method in your profile before placing a bid.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="number"
            min={currentBid + 1}
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            placeholder="Enter bid amount"
            className="flex-1"
            disabled={isSubmitting || isLoading || isAuctionEnded || !hasValidPaymentMethod}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading || !session?.user || isAuctionEnded || !hasValidPaymentMethod}
          >
            {isSubmitting ? "Placing bid..." : "Place Bid"}
          </Button>
        </div>
      </form>
    </div>
  );
};