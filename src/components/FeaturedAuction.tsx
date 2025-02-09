import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { generateWebPUrl, generateSrcSet } from "@/utils/imageUtils";
import { useState } from "react";

interface FeaturedAuctionProps {
  title: string;
  artist: string;
  description: string;
  image: string;
  currentBid: number;
  timeLeft: string;
}

export const FeaturedAuction = ({
  title,
  artist,
  description,
  image,
}: FeaturedAuctionProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`} 
          style={{ 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        />
        
        <picture>
          <source
            type="image/webp"
            srcSet={generateSrcSet(generateWebPUrl(image))}
            sizes="100vw"
          />
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative h-full flex items-end"
      >
        <div className="max-w-[1400px] mx-auto px-6 pb-20 w-full">
          <div className="max-w-2xl text-white space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider">{artist}</h2>
            <h1 className="text-4xl font-serif">{title}</h1>
            <p className="text-sm text-gray-200 max-w-lg">{description}</p>
            
            <Button className="mt-6 bg-white text-black hover:bg-white/90 transition-colors duration-300">
              VIEW Auction
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};