import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { CountdownTimer } from "./auction/CountdownTimer";

interface LotCardProps {
  id?: string;
  title: string;
  artist: string;
  artist_id?: string;
  image: string;
  currentBid: number;
  timeLeft?: string;
  category: string;
  endDate: string | null;
  startingPrice?: number;
}

export const AuctionCard = ({ // keeping the component name for now to avoid breaking imports
  id = "1", 
  title, 
  artist,
  artist_id, 
  image, 
  currentBid, 
  category,
  endDate,
  startingPrice 
}: AuctionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleArtistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (artist_id) {
      navigate(`/artist/${artist_id}`);
    }
  };

  // Determine the price to display - use currentBid if it exists and is greater than 0
  const displayPrice = currentBid > 0 ? currentBid : startingPrice;

  return (
    <Link to={`/auction/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group cursor-pointer"
      >
        <Card className="overflow-hidden bg-white border-0 shadow-none">
          <div className="relative aspect-square overflow-hidden">
            <div className={`absolute inset-0 bg-gray-100 ${imageLoaded ? 'hidden' : 'block'}`} />
            <img
              src={image}
              alt={title}
              className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <div className="p-4">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {artist_id ? (
              <button 
                onClick={handleArtistClick}
                className="block text-left w-full"
              >
                <p className="text-sm text-gray-600 mt-1 hover:text-primary">{artist}</p>
              </button>
            ) : (
              <p className="text-sm text-gray-600 mt-1">{artist}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              <p>
                {currentBid > 0 ? (
                  `Current bid: €${displayPrice?.toLocaleString()}`
                ) : (
                  `Starting price: €${displayPrice?.toLocaleString()}`
                )}
              </p>
              <div className="mt-2">
                <CountdownTimer endDate={endDate} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};