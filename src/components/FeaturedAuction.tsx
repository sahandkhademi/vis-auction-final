import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface FeaturedAuctionProps {
  title: string;
  description: string;
  image: string;
  currentBid: number;
  timeLeft: string;
}

export const FeaturedAuction = ({
  title,
  description,
  image,
  currentBid,
  timeLeft,
}: FeaturedAuctionProps) => {
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
    <div className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative container mx-auto h-full flex items-end pb-20"
      >
        <div className="max-w-2xl text-white space-y-6">
          <Badge className="bg-gold hover:bg-gold-dark text-white border-0">
            Featured Auction
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight">{title}</h1>
          <p className="text-lg text-gray-200">{description}</p>
          
          <div className="flex gap-8 py-4">
            <div>
              <p className="text-gray-300">Current Bid</p>
              <p className="text-2xl font-semibold">${currentBid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-300">Time Left</p>
              <p className="text-2xl font-semibold">{timeLeft}</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <Input
              type="number"
              placeholder="Enter bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              min={currentBid + 1}
            />
            <Button 
              onClick={handleBid}
              className="bg-white text-black hover:bg-gold hover:text-white transition-colors duration-300"
            >
              Place Bid
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};