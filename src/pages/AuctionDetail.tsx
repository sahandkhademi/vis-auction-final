import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArtworkImage } from "@/components/auction/ArtworkImage";
import { AuctionDetails } from "@/components/auction/AuctionDetails";
import { ArtworkWithArtist } from "@/types/auction";
import { useAuctionSubscription } from "@/hooks/useAuctionSubscription";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: artwork, error: artworkError, refetch } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      if (!id) throw new Error('No artwork ID provided');
      
      const { data: artworkWithLinkedArtist, error: linkedError } = await supabase
        .from('artworks')
        .select(`
          *,
          artist:artists!artworks_artist_id_fkey (
            id,
            name,
            bio,
            profile_image_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (linkedError) {
        console.error('Error fetching artwork:', linkedError);
        throw linkedError;
      }

      return artworkWithLinkedArtist as ArtworkWithArtist;
    },
    enabled: !!id,
  });

  // Use custom hook for subscriptions
  useAuctionSubscription(id, refetch, setCurrentHighestBid);

  const fetchCurrentHighestBid = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('bids')
      .select('amount')
      .eq('auction_id', id)
      .order('amount', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching highest bid:', error);
      return;
    }

    if (data) {
      setCurrentHighestBid(data.amount);
    }
  };

  if (artworkError) {
    toast.error("Error loading artwork details");
    return null;
  }

  if (!artwork) {
    return <div className="min-h-screen bg-white pt-20 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Button
          variant="ghost"
          className="mb-8 text-gray-600 hover:text-gray-900 -ml-4"
          onClick={() => navigate("/auctions")}
        >
          ← Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ArtworkImage 
            imageUrl={artwork.image_url} 
            title={artwork.title} 
          />

          <AuctionDetails
            artwork={artwork}
            currentHighestBid={currentHighestBid}
            isLoading={isLoading}
            onBidPlaced={fetchCurrentHighestBid}
          />
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;