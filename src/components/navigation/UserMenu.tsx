import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

export const UserMenu = () => {
  return (
    <div className="flex items-center space-x-4">
      <NotificationBadge />
      <Link to="/profile">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-900"
          aria-label="Profile"
        >
          <User className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};