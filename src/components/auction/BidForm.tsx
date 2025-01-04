import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  isLoading: boolean;
  onBidPlaced: () => void;
}

export const BidForm = ({ 
  auctionId, 
  currentBid, 
  isLoading,
  onBidPlaced 
}: BidFormProps) => {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to place a bid");
      return;
    }

    const numericBid = parseFloat(bidAmount);
    if (isNaN(numericBid) || numericBid <= currentBid) {
      toast.error(`Bid must be higher than €${currentBid.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Fetching current highest bid...');
      // Get the current highest bid and user
      const { data: currentBids, error: bidError } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1);

      if (bidError) {
        console.error('Error fetching current bids:', bidError);
        throw bidError;
      }

      console.log('Current highest bid:', currentBids?.[0]);
      const previousHighestBid = currentBids?.[0];

      console.log('Placing new bid...');
      // Place the new bid
      const { error: newBidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          user_id: session.user.id,
          amount: numericBid
        });

      if (newBidError) {
        console.error('Error placing bid:', newBidError);
        if (newBidError.code === '23505') {
          toast.error("This bid amount has already been placed. Please enter a different amount.");
        } else {
          toast.error("Error placing bid. Please try again.");
        }
        return;
      }

      // If there was a previous highest bidder, notify them
      if (previousHighestBid && previousHighestBid.user_id !== session.user.id) {
        console.log('Creating notification for outbid user:', previousHighestBid.user_id);
        // Create notification for the outbid user
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: previousHighestBid.user_id,
            title: "You've Been Outbid!",
            message: `Someone has placed a higher bid of €${numericBid.toLocaleString()} on an auction you were winning.`,
            type: 'outbid'
          });

        if (notificationError) {
          console.error('Error creating outbid notification:', notificationError);
        } else {
          console.log('Notification created successfully');
        }
      }

      toast.success("Bid placed successfully!");
      setBidAmount("");
      onBidPlaced();
    } catch (error) {
      console.error('Error in bid placement:', error);
      toast.error("Error placing bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please sign in to place a bid</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="number"
          step="0.01"
          min={currentBid + 0.01}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder={`Enter bid amount higher than €${currentBid.toLocaleString()}`}
          disabled={isLoading || isSubmitting}
          className="w-full"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || isSubmitting || !bidAmount}
        className="w-full"
      >
        {isSubmitting ? "Placing Bid..." : "Place Bid"}
      </Button>
    </form>
  );
};