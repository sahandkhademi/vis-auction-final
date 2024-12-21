import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredAuctions = [
    {
      id: 1,
      artist: "ALESSIO ISSUPOFF",
      title: "Russian Village in Winter",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      buttonText: "VIEW LOTS"
    },
    {
      id: 2,
      artist: "LYDIA MASTERKOVA",
      title: "Northern Settlement",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      buttonText: "VIEW LOTS"
    }
  ];

  const trendingLots = [
    {
      id: 1,
      artist: "PREDRAG MILOSAVLJEVIC",
      title: "Monumental Composition",
      estimate: "$6,000 - $8,000",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80"
    },
    {
      id: 2,
      artist: "KONSTANTIN MAKSIMOV",
      title: "Paris at Night",
      estimate: "$2,000 - $3,000",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&auto=format&fit=crop&w=879&q=80"
    },
    {
      id: 3,
      artist: "TENG-HIOK CHIU",
      title: "Bali",
      estimate: "$8,000 - $12,000",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80"
    },
    {
      id: 4,
      artist: "LE PHO",
      title: "Women picking Flowers",
      estimate: "$3,000 - $6,000",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Featured Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {featuredAuctions.map((auction) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-[500px] group cursor-pointer"
            >
              <img
                src={auction.image}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40">
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-2xl font-light mb-1">{auction.artist}</h2>
                  <h3 className="text-xl mb-4">{auction.title}</h3>
                  <button className="bg-white text-black px-6 py-2 text-sm hover:bg-gray-100 transition-colors">
                    {auction.buttonText}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trending Lots Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl">Trending lots</h2>
            <Link to="/auctions" className="text-sm text-gray-600 hover:text-black">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingLots.map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden mb-3">
                  <img
                    src={lot.image}
                    alt={lot.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-medium mb-1">{lot.artist}</h3>
                <p className="text-sm text-gray-600 mb-2">{lot.title}</p>
                <p className="text-sm text-gray-500">Estimate: {lot.estimate}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;