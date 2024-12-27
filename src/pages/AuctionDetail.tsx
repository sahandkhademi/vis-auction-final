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
import { CountdownTimer } from "@/components/auction/CountdownTimer";

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
      
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          artist_details:artists!artist_id (
            name,
            bio,
            profile_image_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Artwork not found');
      return data;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3]"
          >
            <img
              src={artwork.image_url || '/placeholder.svg'}
              alt={artwork.title}
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
              <p className="text-sm uppercase tracking-wider text-gray-500">{artwork.artist}</p>
              <h1 className="text-4xl font-light tracking-tight text-gray-900">
                {artwork.title}
              </h1>
              <p className="text-base text-gray-600 leading-relaxed mt-4">
                {artwork.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wider text-gray-500">Current Bid</p>
                <p className="text-2xl font-light">
                  ${(currentHighestBid || artwork.starting_price).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wider text-gray-500">Time Remaining</p>
                <CountdownTimer endDate={artwork.end_date} />
              </div>
            </div>

            <div className="pt-6">
              <BidForm
                auctionId={id || ""}
                currentHighestBid={currentHighestBid}
                defaultBid={artwork.starting_price}
                isLoading={isLoading}
                onBidPlaced={fetchCurrentHighestBid}
              />
            </div>

            <BidHistory auctionId={id || ""} />

            <ArtistInfo
              name={artwork.artist_details?.name || artwork.artist}
              bio={artwork.artist_details?.bio}
              profileImageUrl={artwork.artist_details?.profile_image_url}
            />

            <AuctionInfo
              artist={artwork.artist}
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