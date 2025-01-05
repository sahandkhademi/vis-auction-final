import { motion } from "framer-motion";
import { ArtworkWithArtist } from "@/types/auction";
import { ArtworkHeader } from "./ArtworkHeader";
import { AuctionStatus } from "./AuctionStatus";
import { BidForm } from "./BidForm";
import { BidHistory } from "./BidHistory";
import { ArtistInfo } from "./ArtistInfo";
import { AuctionInfo } from "./AuctionInfo";
import { CountdownTimer } from "./CountdownTimer";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const artistData = typeof artwork.artist === 'object' ? artwork.artist : null;
  const artistName = artistData?.name || (typeof artwork.artist === 'string' ? artwork.artist : 'Unknown Artist');

  const currentPrice = currentHighestBid || artwork.starting_price;

  const handleTimerEnd = () => {
    toast({
      title: "Auction Ended",
      description: "This auction has ended. The page will refresh to show the final results.",
    });
    // Refresh the page to show the updated auction status
    window.location.reload();
  };

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

      {artwork.completion_status === 'ongoing' && (
        <CountdownTimer 
          endDate={artwork.end_date} 
          onTimerEnd={handleTimerEnd}
        />
      )}

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