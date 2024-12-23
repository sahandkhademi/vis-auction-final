import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { BidForm } from "@/components/auction/BidForm";
import { AuctionInfo } from "@/components/auction/AuctionInfo";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

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
              <BidForm
                auctionId={id || ""}
                currentHighestBid={currentHighestBid}
                defaultBid={auction.currentBid}
                isLoading={isLoading}
                onBidPlaced={fetchCurrentHighestBid}
              />
            </div>

            <AuctionInfo
              artist={auction.artist}
              createdYear={auction.createdYear}
              dimensions={auction.dimensions}
              format={auction.format}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;