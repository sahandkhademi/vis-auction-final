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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      console.log("No authenticated user found");
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    console.log("Starting bid submission:", { 
      auctionId, 
      bidAmount, 
      currentBid, 
      userId: session.user.id 
    });

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
      // Insert the bid
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

      console.log("Bid inserted successfully:", bidData);

      // Update the artwork's current price
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

      console.log("Artwork price updated successfully");
      
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