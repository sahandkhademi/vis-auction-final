import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationMenuProps {
  isScrolled: boolean;
}

export const NavigationMenu = ({ isScrolled }: NavigationMenuProps) => {
  return (
    <nav className={cn(
      "flex items-center space-x-8",
      isScrolled ? "text-gray-900" : "text-white"
    )}>
      <Link
        to="/auctions"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Auctions
      </Link>
      <Link
        to="/about"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        About
      </Link>
      <Link
        to="/faq"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        FAQ
      </Link>
    </nav>
  );
};