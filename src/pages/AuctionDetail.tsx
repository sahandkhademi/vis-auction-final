import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArtworkImage } from "@/components/auction/ArtworkImage";
import { AuctionDetails } from "@/components/auction/AuctionDetails";
import { ArtworkWithArtist } from "@/types/auction";

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

      if (artworkWithLinkedArtist?.artist) {
        console.log('Found artwork with linked artist:', artworkWithLinkedArtist);
        return artworkWithLinkedArtist as ArtworkWithArtist;
      }

      return artworkWithLinkedArtist as ArtworkWithArtist;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      fetchCurrentHighestBid();
      subscribeToNewBids();
      subscribeToAuctionUpdates();
    }
  }, [id]);

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

  const subscribeToNewBids = () => {
    if (!id) return;

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
            toast.info(`New highest bid: €${newBid.amount.toLocaleString()}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToAuctionUpdates = () => {
    if (!id) return;

    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const newData = payload.new as { completion_status: string };
          
          // If auction status changes to completed, refresh the page data
          if (newData.completion_status === 'completed') {
            await refetch();
            toast.info("This auction has ended");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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