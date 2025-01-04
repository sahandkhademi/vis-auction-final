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

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing bids:', checkError);
        throw checkError;
      }

      // Get the current highest bidder before placing new bid
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

      const previousHighestBid = currentBids?.[0];
      console.log('Previous highest bid:', previousHighestBid);

      // Place the new bid
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
        throw newBidError;
      }

      console.log('New bid placed successfully:', newBid);

      // Update artwork current price
      const { error: updateError } = await supabase
        .from('artworks')
        .update({ current_price: numericBid })
        .eq('id', auctionId);

      if (updateError) {
        console.error('Error updating artwork price:', updateError);
        throw updateError;
      }

      // If there was a previous highest bidder, notify them
      if (previousHighestBid && previousHighestBid.user_id !== session.user.id) {
        console.log('Creating notification for outbid user:', previousHighestBid.user_id);

        // Create in-app notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: previousHighestBid.user_id,
            title: "You've Been Outbid!",
            message: `Someone has placed a higher bid of €${numericBid.toLocaleString()} on an auction you were winning.`,
            type: 'outbid'
          });

        if (notificationError) {
          console.error('Error creating in-app notification:', notificationError);
        }

        // Send email notification via edge function
        const { error: emailError } = await supabase.functions.invoke('send-auction-update', {
          body: {
            userId: previousHighestBid.user_id,
            auctionId,
            type: 'outbid',
            newBidAmount: numericBid
          }
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
        }
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