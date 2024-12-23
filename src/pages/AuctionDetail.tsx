import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuth();

  // Mock auction data - in a real app, this would come from an API
  const auction = {
    id: parseInt(id || "1"),
    title: "Digital Dystopia",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    currentBid: 5000,
    timeLeft: "1d 8h 45m",
    category: "Digital Art",
    description: "A stunning piece that explores the intersection of technology and human existence. This digital masterpiece combines elements of cyberpunk aesthetics with contemporary digital art techniques.",
    artist: "Digital Artist X",
    createdYear: "2024",
    dimensions: "4000x3000px",
    format: "Digital NFT"
  };

  useEffect(() => {
    fetchCurrentHighestBid();
    subscribeToNewBids();
  }, [id]);

  const fetchCurrentHighestBid = async () => {
    const { data, error } = await supabase
      .from('bids')
      .select('amount')
      .eq('auction_id', id)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching highest bid:', error);
      return;
    }

    if (data) {
      setCurrentHighestBid(data.amount);
    }
  };

  const subscribeToNewBids = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${id}`
        },
        (payload) => {
          const newBid = payload.new as { amount: number };
          if (newBid.amount > (currentHighestBid || 0)) {
            setCurrentHighestBid(newBid.amount);
            toast.info(`New highest bid: $${newBid.amount.toLocaleString()}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
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

    setIsLoading(true);
    
    const { error } = await supabase
      .from('bids')
      .insert([
        {
          auction_id: id,
          amount: amount,
          user_id: user.id
        }
      ]);

    setIsLoading(false);

    if (error) {
      console.error('Error placing bid:', error);
      toast.error("Failed to place bid. Please try again.");
      return;
    }

    toast.success(`Bid of $${amount.toLocaleString()} placed successfully!`);
    setBidAmount("");
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Button
          variant="ghost"
          className="mb-8 text-gray-600 hover:text-gray-900 -ml-4"
          onClick={() => navigate("/")}
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3]"
          >
            <img
              src={auction.image}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wider text-gray-500">{auction.artist}</p>
              <h1 className="text-4xl font-light tracking-tight text-gray-900">
                {auction.title}
              </h1>
              <p className="text-base text-gray-600 leading-relaxed mt-4">
                {auction.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wider text-gray-500">Current Bid</p>
                <p className="text-2xl font-light">
                  ${(currentHighestBid || auction.currentBid).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wider text-gray-500">Time Left</p>
                <p className="text-2xl font-light">
                  {auction.timeLeft}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <form onSubmit={handleBid} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="flex-1 h-12 text-lg rounded-none border-gray-200"
                    min={currentHighestBid ? currentHighestBid + 1 : auction.currentBid + 1}
                    disabled={isLoading || !user}
                  />
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-black hover:bg-gray-900 text-white rounded-none"
                    disabled={isLoading || !user}
                  >
                    {isLoading ? "Placing Bid..." : "Place Bid"}
                  </Button>
                </div>
                {!user && (
                  <p className="text-sm text-gray-500 mt-2">
                    Please sign in to place a bid
                  </p>
                )}
              </form>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
                Artwork Details
              </h3>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Artist</dt>
                  <dd className="mt-1 text-gray-900">{auction.artist}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Year</dt>
                  <dd className="mt-1 text-gray-900">{auction.createdYear}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Dimensions</dt>
                  <dd className="mt-1 text-gray-900">{auction.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Format</dt>
                  <dd className="mt-1 text-gray-900">{auction.format}</dd>
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