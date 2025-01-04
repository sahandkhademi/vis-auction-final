import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to place bid:", { auctionId, bidAmount, userId: session?.user?.id });

    if (!session?.user) {
      console.log("No user session found");
      toast({
        title: "Authentication required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (bidAmount <= currentBid) {
      console.log("Bid amount too low:", { bidAmount, currentBid });
      toast({
        title: "Invalid bid amount",
        description: "Your bid must be higher than the current bid",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: bidData, error: bidError } = await supabase
        .from("bids")
        .insert({
          auction_id: auctionId,
          amount: bidAmount,
          user_id: session.user.id,
        })
        .select()
        .single();

      console.log("Bid insertion result:", { bidData, bidError });

      if (bidError) {
        console.error("Error inserting bid:", bidError);
        throw bidError;
      }

      const { error: updateError } = await supabase
        .from("artworks")
        .update({ current_price: bidAmount })
        .eq("id", auctionId);

      if (updateError) {
        console.error("Error updating artwork price:", updateError);
        throw updateError;
      }

      toast({
        title: "Bid placed successfully",
        description: `Your bid of €${bidAmount.toLocaleString()} has been placed`,
      });

      onBidPlaced();
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
          Place Bid
        </Button>
      </div>
    </form>
  );
};