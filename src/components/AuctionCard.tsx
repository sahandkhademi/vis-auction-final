import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuctionCardProps {
  title: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  category: string;
}

export const AuctionCard = ({ title, image, currentBid, timeLeft, category }: AuctionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-gold/30 transition-all duration-300">
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
          <Badge variant="outline" className="mb-2 bg-white/50 text-xs font-medium">
            {category}
          </Badge>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-500">Current Bid</p>
              <p className="font-semibold text-gold">${currentBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Time Left</p>
              <p className="font-medium text-gray-700">{timeLeft}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};