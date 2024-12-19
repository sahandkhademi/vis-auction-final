import { FeaturedAuction } from "@/components/FeaturedAuction";
import { AuctionCard } from "@/components/AuctionCard";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const featuredAuction = {
    title: "Ethereal Luminescence by Sarah Chen",
    description: "A masterpiece that captures the ephemeral nature of light and shadow through innovative digital techniques. This piece represents a breakthrough in digital art.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    currentBid: 15000,
    timeLeft: "2d 15h 30m"
  };

  const auctions = [
    {
      id: 1,
      title: "Digital Dystopia",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 5000,
      timeLeft: "1d 8h 45m",
      category: "Digital Art"
    },
    {
      id: 2,
      title: "Neon Dreams",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 3200,
      timeLeft: "15h 20m",
      category: "Photography"
    },
    {
      id: 3,
      title: "Abstract Thoughts",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&auto=format&fit=crop&w=879&q=80",
      currentBid: 7500,
      timeLeft: "3d 12h",
      category: "Abstract"
    },
    {
      id: 4,
      title: "Future Perfect",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 4200,
      timeLeft: "2d 5h 15m",
      category: "Landscape"
    }
  ];

  const filteredAndSortedAuctions = auctions
    .filter(auction => {
      const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.currentBid - a.currentBid;
      if (sortBy === "lowest") return a.currentBid - b.currentBid;
      return 0; // "newest" is default, keep original order
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <FeaturedAuction {...featuredAuction} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Auctions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique digital artworks from leading artists around the world
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select defaultValue={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Digital Art">Digital Art</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Abstract">Abstract</SelectItem>
                <SelectItem value="Landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select defaultValue={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="highest">Highest Price</SelectItem>
                <SelectItem value="lowest">Lowest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSortedAuctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;