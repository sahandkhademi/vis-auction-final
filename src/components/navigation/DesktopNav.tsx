import { Link } from "react-router-dom";
import { NavigationLinks } from "./NavigationLinks";

export const DesktopNav = () => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {NavigationLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};