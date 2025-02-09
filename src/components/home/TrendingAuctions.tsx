import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuctionCard } from "@/components/AuctionCard";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const TrendingAuctions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const endDate = new Date(Date.now() + 10000);

      const { data, error } = await supabase
        .from("artworks")
        .insert([
          {
            title: "Test Auction - Ends in 10s",
            artist: "Test Artist",
            description: "This is a test auction that will end in 10 seconds.",
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
        description: "The auction will end in 10 seconds. Place a bid to test notifications.",
      });

      if (data) {
        navigate(`/auction/${data.id}`);
      }

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-medium text-gray-900">Trending Lots</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={createTestAuction}
            variant="secondary"
            className="text-sm"
          >
            Create Test Lot
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
              Browse all lots
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};