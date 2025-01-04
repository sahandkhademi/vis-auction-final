import { Link } from "react-router-dom";
import { navigationLinks } from "./NavigationLinks";

export const DesktopNav = () => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {navigationLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};