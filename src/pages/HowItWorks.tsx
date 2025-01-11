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
          <div className="bg-secondary/50 rounded-lg p-6">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">1. Register Your Account</h2>
            <p className="text-gray-600">
              To get started, create an account by signing up with your email and verifying your account using the code we send you. Once verified, you’ll have access to your dashboard.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-6">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">2. Add a Payment Method</h2>
            <p className="text-gray-600">
              Before placing bids, you need to add a payment method. Go to your profile dashboard and click the "Payment" tab. Enter your payment details securely—this will allow you to bid on items and complete payments if you win.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-6">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">3. Understand the Auction Process</h2>
            <p className="text-gray-600">
              An auction is a way of selling items where people compete by offering prices, called "bids." Each item has a starting price, which is the minimum amount you can bid. If someone else places a higher bid, you’ll need to offer a higher price to stay in the running. The person with the highest bid when the auction closes wins the item.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-6">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">4. Browse & Bid</h2>
            <p className="text-gray-600">
              Explore unique artworks created by our young artists. Found something you love? Enter your bid and confirm. You’ll get email updates if you’re outbid.
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-6">
            <h2 className="text-2xl font-medium mb-4 text-[#00337F]">4. Win & Pay</h2>
            <p className="text-gray-600">
              If you win the auction, congratulations! Your payment method will be automatically charged for the final bid amount. You’ll receive an email confirmation with all the details, and our team will contact you directly to discuss delivery options. 
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
