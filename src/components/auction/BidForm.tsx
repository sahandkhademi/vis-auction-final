import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface BidFormProps {
  auctionId: string;
  currentHighestBid: number | null;
  defaultBid: number;
  isLoading: boolean;
  onBidPlaced: () => void;
}

export const BidForm = ({ 
  auctionId, 
  currentHighestBid, 
  defaultBid,
  isLoading,
  onBidPlaced 
}: BidFormProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const session = useSession();

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to place a bid");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (currentHighestBid && amount <= currentHighestBid) {
      toast.error(`Bid must be higher than current bid: $${currentHighestBid.toLocaleString()}`);
      return;
    }

    const { error } = await supabase
      .from('bids')
      .insert([
        {
          auction_id: auctionId,
          amount: amount,
          user_id: session.user.id
        }
      ]);

    if (error) {
      console.error('Error placing bid:', error);
      toast.error("Failed to place bid. Please try again.");
      return;
    }

    toast.success(`Bid of $${amount.toLocaleString()} placed successfully!`);
    setBidAmount("");
    onBidPlaced();
  };

  return (
    <form onSubmit={handleBid} className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
          className="flex-1 h-12 text-lg rounded-none border-gray-200"
          min={currentHighestBid ? currentHighestBid + 1 : defaultBid + 1}
          disabled={isLoading || !session}
        />
        <Button 
          type="submit" 
          className="h-12 px-8 bg-black hover:bg-gray-900 text-white rounded-none"
          disabled={isLoading || !session}
        >
          {isLoading ? "Placing Bid..." : "Place Bid"}
        </Button>
      </div>
      {!session && (
        <p className="text-sm text-gray-500 mt-2">
          Please sign in to place a bid
        </p>
      )}
    </form>
  );
};