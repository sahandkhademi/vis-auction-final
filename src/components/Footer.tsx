import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-8">
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
              Connecting young artists with patrons
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Information</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/auctions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Current Lots
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/submit-art" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Submit Your Art
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Support & Help</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@visauction.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Connect With Us</h4>
              <p className="text-sm text-gray-600 mb-4">Follow us on Instagram for daily updates on new artworks and upcoming auctions.</p>
              <div className="flex space-x-4">
                <a href="https://instagram.com/visauction" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
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