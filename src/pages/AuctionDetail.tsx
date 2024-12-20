import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          created_by:profiles(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const placeBidMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Must be logged in to place bid");

      const { data, error } = await supabase
        .from('bidding_history')
        .insert([
          {
            auction_id: id,
            user_id: user.user.id,
            amount: amount
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Bid placed successfully!");
      setBidAmount("");
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= (auction?.current_bid || auction?.starting_bid || 0)) {
      toast.error("Please enter a bid higher than the current bid");
      return;
    }

    placeBidMutation.mutate(amount);
  };

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (!auction) {
    return <div className="container mx-auto p-8">Auction not found</div>;
  }

  const currentBid = auction.current_bid || auction.starting_bid;
  const timeLeft = new Date(auction.end_time).getTime() - new Date().getTime();
  const isEnded = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate("/")}
        >
          ← Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-lg overflow-hidden">
              <img
                src={auction.image_url}
                alt={auction.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold text-gray-900">{auction.title}</h1>
            <p className="text-lg text-gray-600">{auction.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500">Current Bid</p>
                <p className="text-2xl font-semibold text-gold">
                  ${currentBid?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500">Time Left</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isEnded ? "Auction Ended" : new Date(auction.end_time).toLocaleDateString()}
                </p>
              </div>
            </div>

            {!isEnded && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Place a Bid</h3>
                <form onSubmit={handleBid} className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      className="flex-1"
                      min={currentBid + 1}
                      step="0.01"
                    />
                    <Button 
                      type="submit"
                      disabled={placeBidMutation.isPending}
                    >
                      Place Bid
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Auction Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Created By</dt>
                  <dd className="font-medium">{auction.created_by?.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Start Date</dt>
                  <dd className="font-medium">{new Date(auction.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">End Date</dt>
                  <dd className="font-medium">{new Date(auction.end_time).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium capitalize">{auction.status}</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;