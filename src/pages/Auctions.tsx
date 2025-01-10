import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCard } from "@/components/AuctionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Auctions = () => {
  const { data: artworks, isLoading, error } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      console.log("Fetching artworks...");
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching artworks:", error);
        throw error;
      }
      
      console.log("Fetched artworks:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load auctions. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Current Lots</h1>
      {artworks && artworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No active auctions available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Auctions;