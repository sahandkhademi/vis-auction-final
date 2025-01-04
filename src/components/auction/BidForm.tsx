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
    console.log('Starting bid submission process...');
    
    if (!session) {
      console.log('No session found, user must be logged in');
      toast.error("Please sign in to place a bid");
      return;
    }

    const numericBid = parseFloat(bidAmount);
    if (isNaN(numericBid) || numericBid <= currentBid) {
      console.log('Invalid bid amount:', { numericBid, currentBid });
      toast.error(`Bid must be higher than €${currentBid.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if this exact bid amount already exists
      const { data: existingBids, error: checkError } = await supabase
        .from('bids')
        .select('amount')
        .eq('auction_id', auctionId)
        .eq('amount', numericBid)
        .single();

      if (existingBids) {
        console.log('Duplicate bid amount detected:', numericBid);
        toast.error("This bid amount has already been placed. Please enter a different amount.");
        setIsSubmitting(false);
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking existing bids:', checkError);
        throw checkError;
      }

      console.log('Fetching current highest bid...');
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

      console.log('Current highest bid data:', currentBids);
      const previousHighestBid = currentBids?.[0];

      console.log('Placing new bid...');
      const { data: newBid, error: newBidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          user_id: session.user.id,
          amount: numericBid
        })
        .select()
        .single();

      if (newBidError) {
        console.error('Error placing bid:', newBidError);
        if (newBidError.code === '23505') {
          toast.error("This bid amount has already been placed. Please enter a different amount.");
        } else {
          toast.error("Error placing bid. Please try again.");
        }
        return;
      }

      console.log('New bid placed successfully:', newBid);

      // If there was a previous highest bidder, notify them
      if (previousHighestBid && previousHighestBid.user_id !== session.user.id) {
        console.log('Creating notification for outbid user:', {
          previousBidder: previousHighestBid.user_id,
          currentBidder: session.user.id,
          newAmount: numericBid
        });

        const notificationData = {
          user_id: previousHighestBid.user_id,
          title: "You've Been Outbid!",
          message: `Someone has placed a higher bid of €${numericBid.toLocaleString()} on an auction you were winning.`,
          type: 'outbid'
        };

        console.log('Attempting to create notification with data:', notificationData);
        
        const { data: notificationResult, error: notificationError } = await supabase
          .from('notifications')
          .insert(notificationData)
          .select()
          .single();

        if (notificationError) {
          console.error('Error creating outbid notification:', notificationError);
          console.error('Full error details:', {
            message: notificationError.message,
            details: notificationError.details,
            hint: notificationError.hint,
            code: notificationError.code
          });
        } else {
          console.log('Notification created successfully:', notificationResult);
        }
      } else {
        console.log('No notification needed:', {
          hasPreviousBid: !!previousHighestBid,
          isSameUser: previousHighestBid?.user_id === session.user.id
        });
      }

      toast.success("Bid placed successfully!");
      setBidAmount("");
      onBidPlaced();
    } catch (error) {
      console.error('Unexpected error in bid placement:', error);
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