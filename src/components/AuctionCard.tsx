import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AuctionCardProps {
  id?: string;  // Changed from number to string to match Supabase UUID
  title: string;
  artist: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  category: string;
}

export const AuctionCard = ({ id = "1", title, artist, image, currentBid, category }: AuctionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to={`/auction/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group cursor-pointer"
      >
        <Card className="overflow-hidden bg-white border-0 shadow-none">
          <div className="relative aspect-[4/3] overflow-hidden">
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
            <h3 className="text-sm font-medium text-gray-900 uppercase">{artist}</h3>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
            <div className="mt-2 text-xs text-gray-500">
              <p>Estimate: ${currentBid.toLocaleString()} – ${(currentBid * 1.2).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};