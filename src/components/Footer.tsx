import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Digital Bid Bazaar</h3>
            <p className="text-sm">
              Your premier destination for digital art auctions and collectibles.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">About</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gold transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <p className="text-sm mb-4">Stay updated with our latest auctions</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Digital Bid Bazaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;