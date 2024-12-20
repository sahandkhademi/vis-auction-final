import { FeaturedAuction } from "@/components/FeaturedAuction";
import { AuctionCard } from "@/components/AuctionCard";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: auctions, isLoading } = useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const featuredAuction = auctions?.[0] ? {
    title: auctions[0].title,
    description: auctions[0].description || "",
    image: auctions[0].image_url,
    currentBid: Number(auctions[0].current_bid) || Number(auctions[0].starting_bid),
    timeLeft: new Date(auctions[0].end_time).toLocaleDateString()
  } : {
    title: "No auctions available",
    description: "Check back later for new auctions",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    currentBid: 0,
    timeLeft: "N/A"
  };

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FeaturedAuction {...featuredAuction} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Auctions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique digital artworks from leading artists around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions?.map((auction) => (
            <AuctionCard 
              key={auction.id}
              id={auction.id}
              title={auction.title}
              image={auction.image_url}
              currentBid={Number(auction.current_bid) || Number(auction.starting_bid)}
              timeLeft={new Date(auction.end_time).toLocaleDateString()}
              category="Digital Art"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;