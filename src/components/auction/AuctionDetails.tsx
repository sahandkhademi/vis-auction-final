import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArtworkWithArtist } from "@/types/auction";
import { ArtworkHeader } from "./ArtworkHeader";
import { AuctionStatus } from "./AuctionStatus";
import { BidForm } from "./BidForm";
import { BidHistory } from "./BidHistory";
import { ArtistInfo } from "./ArtistInfo";
import { AuctionInfo } from "./AuctionInfo";
import { supabase } from "@/integrations/supabase/client";

interface AuctionDetailsProps {
  artwork: ArtworkWithArtist;
  currentHighestBid: number | null;
  isLoading: boolean;
  onBidPlaced: () => void;
}

export const AuctionDetails = ({ 
  artwork, 
  currentHighestBid, 
  isLoading,
  onBidPlaced 
}: AuctionDetailsProps) => {
  const artistData = typeof artwork.artist === 'object' ? artwork.artist : null;
  const artistName = artistData?.name || (typeof artwork.artist === 'string' ? artwork.artist : 'Unknown Artist');
  const [currentPrice, setCurrentPrice] = useState<number>(artwork.current_price || currentHighestBid || artwork.starting_price);

  // Subscribe to real-time price updates
  useEffect(() => {
    const channel = supabase
      .channel('artwork-price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${artwork.id}`,
        },
        (payload) => {
          const newData = payload.new as { current_price: number };
          if (newData.current_price) {
            console.log('📈 Received price update:', newData.current_price);
            setCurrentPrice(newData.current_price);
          }
        }
      )
      .subscribe();

    // Also subscribe to new bids to update price immediately
    const bidsChannel = supabase
      .channel('artwork-bids-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${artwork.id}`,
        },
        (payload) => {
          const newBid = payload.new as { amount: number };
          console.log('📈 Received new bid:', newBid.amount);
          setCurrentPrice(newBid.amount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(bidsChannel);
    };
  }, [artwork.id]);

  // Update current price when props change
  useEffect(() => {
    const newPrice = artwork.current_price || currentHighestBid || artwork.starting_price;
    if (newPrice !== currentPrice) {
      setCurrentPrice(newPrice);
    }
  }, [artwork.current_price, currentHighestBid, artwork.starting_price]);

  return (
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
        currentBid={currentPrice}
        endDate={artwork.end_date}
        completionStatus={artwork.completion_status}
        paymentStatus={artwork.payment_status}
        winnerId={artwork.winner_id}
        auctionId={artwork.id}
      />

      {artwork.completion_status === 'ongoing' && (
        <div className="pt-6">
          <BidForm
            auctionId={artwork.id}
            currentBid={currentPrice}
            isLoading={isLoading}
            onBidPlaced={onBidPlaced}
            completionStatus={artwork.completion_status}
            endDate={artwork.end_date}
          />
        </div>
      )}

      <BidHistory auctionId={artwork.id} />

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
  );
};