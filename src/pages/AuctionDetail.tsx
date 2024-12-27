import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { BidForm } from "@/components/auction/BidForm";
import { AuctionInfo } from "@/components/auction/AuctionInfo";
import { BidHistory } from "@/components/auction/BidHistory";
import { ArtistInfo } from "@/components/auction/ArtistInfo";
import { useQuery } from "@tanstack/react-query";
import { ArtworkImage } from "@/components/auction/ArtworkImage";
import { ArtworkHeader } from "@/components/auction/ArtworkHeader";
import { AuctionStatus } from "@/components/auction/AuctionStatus";

interface Artist {
  id: string;
  name: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

interface ArtworkWithArtist {
  id: string;
  title: string;
  artist: string | Artist;
  description: string | null;
  created_year: string | null;
  dimensions: string | null;
  format: string | null;
  starting_price: number;
  current_price: number | null;
  image_url: string | null;
  status: string | null;
  end_date: string | null;
  completion_status: string | null;
  payment_status: string | null;
  winner_id: string | null;
}

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const { data: artwork, error: artworkError } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      if (!id) throw new Error('No artwork ID provided');
      
      // First try to get the artwork with its linked artist
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

      // If we found the artwork with a linked artist, return it
      if (artworkWithLinkedArtist?.artist) {
        console.log('Found artwork with linked artist:', artworkWithLinkedArtist);
        return artworkWithLinkedArtist as ArtworkWithArtist;
      }

      // If no linked artist, try to find the artist by name
      if (artworkWithLinkedArtist?.artist && artworkWithLinkedArtist.artist !== '') {
        const { data: artistByName, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('name', artworkWithLinkedArtist.artist)
          .maybeSingle();

        if (!artistError && artistByName) {
          return {
            ...artworkWithLinkedArtist,
            artist: artistByName
          } as ArtworkWithArtist;
        }
      }

      // If we get here, return the artwork without artist info
      return artworkWithLinkedArtist as ArtworkWithArtist;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      fetchCurrentHighestBid();
      subscribeToNewBids();
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
            toast.info(`New highest bid: $${newBid.amount.toLocaleString()}`);
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

  const artistData = typeof artwork.artist === 'object' ? artwork.artist : null;
  const artistName = artistData?.name || (typeof artwork.artist === 'string' ? artwork.artist : 'Unknown Artist');

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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <ArtworkHeader
              artistName={artistName}
              title={artwork.title}
              description={artwork.description}
            />

            <AuctionStatus
              currentBid={currentHighestBid || artwork.starting_price}
              endDate={artwork.end_date}
              completionStatus={artwork.completion_status}
              paymentStatus={artwork.payment_status}
              winnerId={artwork.winner_id}
            />

            {artwork.completion_status === 'ongoing' && (
              <div className="pt-6">
                <BidForm
                  auctionId={id || ""}
                  currentHighestBid={currentHighestBid}
                  defaultBid={artwork.starting_price}
                  isLoading={isLoading}
                  onBidPlaced={fetchCurrentHighestBid}
                />
              </div>
            )}

            <BidHistory auctionId={id || ""} />

            <ArtistInfo
              name={artistName}
              bio={artistData?.bio}
              profileImageUrl={artistData?.profile_image_url}
              artistId={artistData?.id}
            />

            <AuctionInfo
              artist={artistName}
              createdYear={artwork.created_year || ""}
              dimensions={artwork.dimensions || ""}
              format={artwork.format || ""}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
