import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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
