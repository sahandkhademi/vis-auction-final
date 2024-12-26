import { FeaturedAuction } from "@/components/FeaturedAuction";
import { AuctionCard } from "@/components/AuctionCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const featuredAuction = {
    title: "Russian Village in Winter",
    artist: "ALESSIO ISSUPOFF",
    description: "A masterpiece capturing the serene beauty of a Russian winter landscape.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    currentBid: 15000,
    timeLeft: "2d 15h 30m"
  };

  const { data: trendingArtworks, isLoading, error } = useQuery({
    queryKey: ["trending-artworks"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select("*")
          .eq("status", "published")
          .order("current_price", { ascending: false })
          .limit(4);

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error("Error fetching artworks:", err);
        return [];
      }
    },
  });

  // If there's an error, we'll still show the UI but with empty trending artworks
  const safeArtworks = trendingArtworks || [];

  return (
    <div className="min-h-screen bg-white pt-16">
      <FeaturedAuction {...featuredAuction} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] mx-auto px-6 py-16"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-gray-900">Trending lots</h2>
          <Link 
            to="/auctions" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            safeArtworks.map((artwork) => (
              <AuctionCard
                key={artwork.id}
                id={artwork.id}
                title={artwork.title}
                artist={artwork.artist}
                image={artwork.image_url || "/placeholder.svg"}
                currentBid={artwork.current_price || artwork.starting_price}
                category={artwork.format || "Uncategorized"}
                endDate={artwork.end_date}
              />
            ))
          )}
          {!isLoading && safeArtworks.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No active auctions available at the moment.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;