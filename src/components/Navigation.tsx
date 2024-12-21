import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-serif">
            MOSAIC
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/auctions" className="text-sm hover:text-gray-600 transition-colors">
              Auctions
            </Link>
            <Link to="/buy-selling" className="text-sm hover:text-gray-600 transition-colors">
              Buy/Selling
            </Link>
            <Link to="/private-sales" className="text-sm hover:text-gray-600 transition-colors">
              Private sales
            </Link>
            <Link to="/services" className="text-sm hover:text-gray-600 transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm hover:text-gray-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;