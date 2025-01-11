import { motion } from "framer-motion";

const HowItWorks = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6">How Does VIS Auction Work?</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="mb-12">
          <p className="text-gray-600">Your guide to participating in our art auctions</p>
        </div>

        <div className="grid gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">1. Browse Auctions</h2>
            <p className="text-gray-600">
              Explore our curated collection of artworks. Each piece comes with detailed information about the artist, 
              artwork specifications, and current bidding status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">2. Register an Account</h2>
            <p className="text-gray-600">
              Create your account to participate in auctions. This allows you to place bids, track your favorite artworks, 
              and receive notifications about auction updates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">3. Place Your Bids</h2>
            <p className="text-gray-600">
              Once registered, you can place bids on any active auction. You'll receive notifications if you're outbid, 
              allowing you to stay competitive in the bidding process.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">4. Win & Payment</h2>
            <p className="text-gray-600">
              If you win an auction, you'll be notified immediately. Follow the provided instructions to complete your 
              payment and arrange for artwork delivery or pickup.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Have more questions? Check out our <a href="/faq" className="text-[#00337F] hover:underline">FAQ page</a> or{" "}
            <a href="/about" className="text-[#00337F] hover:underline">contact us</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
