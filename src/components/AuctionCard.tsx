import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AuctionCardProps {
  title: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  category: string;
}

export const AuctionCard = ({ title, image, currentBid, timeLeft, category }: AuctionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();

  const handleBid = () => {
    const bid = parseFloat(bidAmount);
    if (isNaN(bid)) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    if (bid <= currentBid) {
      toast({
        title: "Bid too low",
        description: "Your bid must be higher than the current bid",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid placed successfully!",
      description: `You placed a bid of $${bid.toLocaleString()} on ${title}`,
    });
    setBidAmount("");
  };

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
          <div className="flex justify-between items-center text-sm mb-4">
            <div>
              <p className="text-gray-500">Current Bid</p>
              <p className="font-semibold text-gold">${currentBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Time Left</p>
              <p className="font-medium text-gray-700">{timeLeft}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full"
              min={currentBid + 1}
            />
            <Button 
              onClick={handleBid}
              className="w-full bg-gold hover:bg-gold/90 text-white"
            >
              Place Bid
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};