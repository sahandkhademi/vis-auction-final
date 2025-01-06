import { FeaturedAuction } from "@/components/FeaturedAuction";
import { AuctionCard } from "@/components/AuctionCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const featuredAuction = {
    title: "Russian Village in Winter",
    artist: "ALESSIO ISSUPOFF",
    description: "A masterpiece capturing the serene beauty of a Russian winter landscape.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    currentBid: 15000,
    timeLeft: "2d 15h 30m"
  };

  const { data: trendingArtworks, isLoading, error, refetch } = useQuery({
    queryKey: ["trending-artworks"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select("*")
          .eq("status", "published")
          .order("current_price", { ascending: false })
          .limit(4);

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching artworks:", err);
        throw err;
      }
    },
  });

  const createTestAuction = async () => {
    try {
      const endDate = new Date(Date.now() + 30000); // 30 seconds from now

      const { data, error } = await supabase
        .from("artworks")
        .insert([
          {
            title: "Test Auction - Ends in 30s",
            artist: "Test Artist",
            description: "This is a test auction that will end in 30 seconds.",
            created_year: "2024",
            dimensions: "100x100cm",
            format: "Digital",
            starting_price: 100,
            current_price: 100,
            image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
            status: "published",
            end_date: endDate.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Test auction created!",
        description: "The auction will end in 30 seconds. Place a bid to test notifications.",
      });

      // Navigate to the new auction
      if (data) {
        navigate(`/auction/${data.id}`);
      }

      // Refresh the trending artworks list
      refetch();
    } catch (err) {
      console.error("Error creating test auction:", err);
      toast({
        title: "Error",
        description: "Failed to create test auction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white -mt-24">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FeaturedAuction {...featuredAuction} />
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium text-gray-900">Trending lots</h2>
          <div className="flex items-center gap-4">
            <Button
              onClick={createTestAuction}
              variant="secondary"
              className="text-sm"
            >
              Create 30s Test Auction
            </Button>
            <Link 
              to="/auctions" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline"
            >
              View all
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load trending artworks. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="space-y-4 bg-white p-4 rounded-lg shadow-sm"
              >
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </motion.div>
            ))
          ) : (
            <AnimatePresence>
              {trendingArtworks?.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="transform transition-all duration-200 hover:scale-[1.02]"
                >
                  <AuctionCard
                    id={artwork.id}
                    title={artwork.title}
                    artist={artwork.artist}
                    image={artwork.image_url || "/placeholder.svg"}
                    currentBid={artwork.current_price || artwork.starting_price}
                    category={artwork.format || "Uncategorized"}
                    endDate={artwork.end_date}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {!isLoading && (!trendingArtworks || trendingArtworks.length === 0) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-8"
            >
              <p className="text-gray-500">No active auctions available at the moment.</p>
              <Link 
                to="/auctions" 
                className="text-primary hover:text-primary/80 transition-colors mt-2 inline-block"
              >
                Browse all auctions
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;