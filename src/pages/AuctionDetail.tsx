import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");

  // Mock auction data - in a real app, this would come from an API
  const auction = {
    id: parseInt(id || "1"),
    title: "Digital Dystopia",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    currentBid: 5000,
    timeLeft: "1d 8h 45m",
    category: "Digital Art",
    description: "A stunning piece that explores the intersection of technology and human existence. This digital masterpiece combines elements of cyberpunk aesthetics with contemporary digital art techniques.",
    artist: "Digital Artist X",
    createdYear: "2024",
    dimensions: "4000x3000px",
    format: "Digital NFT"
  };

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= auction.currentBid) {
      toast.error("Please enter a bid higher than the current bid");
      return;
    }

    // Here you would typically make an API call to place the bid
    toast.success(`Bid of $${amount.toLocaleString()} placed successfully!`);
    setBidAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate("/")}
        >
          ← Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-lg overflow-hidden">
              <img
                src={auction.image}
                alt={auction.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold text-gray-900">{auction.title}</h1>
            <p className="text-lg text-gray-600">{auction.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500">Current Bid</p>
                <p className="text-2xl font-semibold text-gold">
                  ${auction.currentBid.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500">Time Left</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {auction.timeLeft}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Place a Bid</h3>
              <form onSubmit={handleBid} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="flex-1"
                    min={auction.currentBid + 1}
                  />
                  <Button type="submit">Place Bid</Button>
                </div>
              </form>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Artwork Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Artist</dt>
                  <dd className="font-medium">{auction.artist}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Year</dt>
                  <dd className="font-medium">{auction.createdYear}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Dimensions</dt>
                  <dd className="font-medium">{auction.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Format</dt>
                  <dd className="font-medium">{auction.format}</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;