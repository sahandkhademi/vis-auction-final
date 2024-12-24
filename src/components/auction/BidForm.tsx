import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BidFormProps {
  auctionId: string;
  currentHighestBid: number | null;
  defaultBid: number;
  isLoading?: boolean;
  onBidPlaced?: () => void;
}

export const BidForm = ({
  auctionId,
  currentHighestBid,
  defaultBid,
  isLoading,
  onBidPlaced,
}: BidFormProps) => {
  const [bidAmount, setBidAmount] = useState(
    (currentHighestBid ? currentHighestBid + 10 : defaultBid).toString()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the current highest bid and its user
      const { data: currentBid } = await supabase
        .from('bids')
        .select('user_id, amount')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      // Place the new bid
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          amount: parseFloat(bidAmount),
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (bidError) throw bidError;

      // If there was a previous bid, notify that user they've been outbid
      if (currentBid) {
        await supabase.functions.invoke('handle-outbid', {
          body: {
            previousBidUserId: currentBid.user_id,
            auctionId,
            newBidAmount: parseFloat(bidAmount),
          },
        });
      }

      toast({
        title: "Success",
        description: "Your bid has been placed!",
      });

      onBidPlaced?.();
    } catch (error) {
      console.error('Error placing bid:', error);
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
      <div className="space-y-2">
        <Input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          min={currentHighestBid ? currentHighestBid + 1 : defaultBid}
          step="1"
          disabled={isLoading || isSubmitting}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Placing Bid..." : "Place Bid"}
      </Button>
    </form>
  );
};