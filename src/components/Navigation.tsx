import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gold">
            Digital Bid Bazaar
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gold transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gold transition-colors">
              About
            </Link>
            <Button variant="outline" className="ml-4">
              Sign In
            </Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;