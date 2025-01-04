import { useState } from "react";
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

  // Check authentication before form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!session?.user) {
      console.log('No session found, redirecting to auth');
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    if (bidAmount <= currentBid) {
      console.log('Invalid bid amount:', bidAmount, 'current bid:', currentBid);
      toast({
        title: "Invalid bid amount",
        description: "Your bid must be higher than the current bid",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting bid submission:', { 
      auctionId, 
      amount: bidAmount, 
      userId: session.user.id,
      currentBid
    });

    try {
      // Insert the bid
      const { data: bidData, error: bidError } = await supabase
        .from("bids")
        .insert({
          auction_id: auctionId,
          amount: bidAmount,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (bidError) {
        console.error("Error inserting bid:", bidError);
        throw bidError;
      }

      console.log('Bid inserted successfully:', bidData);

      // Update the artwork's current price
      const { error: updateError } = await supabase
        .from("artworks")
        .update({ current_price: bidAmount })
        .eq("id", auctionId);

      if (updateError) {
        console.error("Error updating artwork price:", updateError);
        throw updateError;
      }

      console.log('Artwork price updated successfully');

      toast({
        title: "Bid placed successfully",
        description: `Your bid of €${bidAmount.toLocaleString()} has been placed`,
      });

      onBidPlaced();
      setBidAmount(bidAmount + 1);
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
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
        />
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Placing bid..." : "Place Bid"}
        </Button>
      </div>
    </form>
  );
};