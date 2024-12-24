import { FeaturedAuction } from "@/components/FeaturedAuction";
import { AuctionCard } from "@/components/AuctionCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredAuction = {
    title: "Russian Village in Winter",
    artist: "ALESSIO ISSUPOFF",
    description: "A masterpiece capturing the serene beauty of a Russian winter landscape.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    currentBid: 15000,
    timeLeft: "2d 15h 30m"
  };

  const auctions = [
    {
      id: 1,
      title: "Monumental Composition",
      artist: "PREDRAG MILOSAVLJEVIC",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 5000,
      timeLeft: "1d 8h 45m",
      category: "Contemporary"
    },
    {
      id: 2,
      title: "Paris at Night",
      artist: "KONSTANTIN MAKSIMOV",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 3200,
      timeLeft: "15h 20m",
      category: "Modern"
    },
    {
      id: 3,
      title: "Bali",
      artist: "TENG-HIOK CHIU",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&auto=format&fit=crop&w=879&q=80",
      currentBid: 7500,
      timeLeft: "3d 12h",
      category: "Contemporary"
    },
    {
      id: 4,
      title: "Woman picking Flowers",
      artist: "LE PHO",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      currentBid: 4200,
      timeLeft: "2d 5h 15m",
      category: "Modern"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      <FeaturedAuction {...featuredAuction} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] mx-auto px-6 py-16"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-gray-900">Trending lots</h2>
          <Link 
            to="/auctions" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;