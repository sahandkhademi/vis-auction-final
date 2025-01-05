import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/48e1bd0c-6d7a-461c-a150-3037fa8f5f59.png" 
                alt="VIS Auction Logo" 
                className="h-8 w-8"
              />
              <h3 className="text-xl font-serif text-gray-900">VIS Auction</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your premier destination for digital art auctions and collectibles.
            </p>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@visauction.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Connect</h4>
            <p className="text-sm text-gray-600 mb-4">Stay updated with our latest auctions</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-8 pt-8 text-sm text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} VIS Auction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;