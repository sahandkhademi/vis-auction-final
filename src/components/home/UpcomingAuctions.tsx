import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const UpcomingAuctions = () => {
  const { data: upcomingArtworks, isLoading, error } = useQuery({
    queryKey: ["upcoming-artworks"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select("*")
          .eq("status", "draft")
          .order("created_at", { ascending: false })
          .limit(2);

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching upcoming artworks:", err);
        throw err;
      }
    },
  });

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load upcoming artworks. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-medium text-gray-900">Upcoming Lots</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full" />
            </div>
          ))
        ) : upcomingArtworks && upcomingArtworks.length > 0 ? (
          <AnimatePresence>
            {upcomingArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative aspect-square overflow-hidden rounded-lg group"
              >
                <img
                  src={artwork.image_url || "/placeholder.svg"}
                  alt={artwork.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-1">{artwork.title}</h3>
                    <p className="text-sm text-gray-200">{artwork.artist}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 text-lg">No active auctions available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};