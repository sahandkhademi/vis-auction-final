import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  onBidPlaced: () => void;
  isLoading?: boolean;
}

export const BidForm = ({ 
  auctionId, 
  currentBid, 
  onBidPlaced,
  isLoading = false
}: BidFormProps) => {
  const [bidAmount, setBidAmount] = useState<number>(currentBid + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setBidAmount(currentBid + 1);
  }, [currentBid]);

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

      // Send email notification via edge function
      const { error: emailError } = await supabase.functions.invoke('send-auction-update', {
        body: {
          userId: previousBidUserId,
          auctionId,
          type: 'outbid',
          newBidAmount: bidAmount
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

    if (!session?.user?.id) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    if (bidAmount <= currentBid) {
      toast({
        title: "Invalid bid amount",
        description: "Your bid must be higher than the current bid",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current highest bid's user, using maybeSingle() instead of single()
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
      toast({
        title: "Failed to place bid",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="number"
          min={currentBid + 1}
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          placeholder="Enter bid amount"
          className="flex-1"
          disabled={isSubmitting || isLoading}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || isLoading || !session?.user}
        >
          {isSubmitting ? "Placing bid..." : "Place Bid"}
        </Button>
      </div>
    </form>
  );
};