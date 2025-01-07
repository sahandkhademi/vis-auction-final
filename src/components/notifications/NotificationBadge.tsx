import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "./useNotifications";
import { markAsRead, markAllAsRead } from "./NotificationActions";

export const NotificationBadge = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { notifications, unreadCount, setUnreadCount, refetch } = useNotifications();

  const handleMarkAsRead = async (id: string, type: string, entityId?: string) => {
    const { error, type: notifType, entityId: notifEntityId } = 
      await markAsRead(id, type, entityId, setUnreadCount);
      
    if (!error && notifEntityId) {
      switch (notifType) {
        case 'auction_won':
        case 'outbid':
        case 'auction_expired':
          navigate(`/auction/${notifEntityId}`);
          break;
        case 'payment_success':
          navigate(`/profile`);
          break;
        default:
          break;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const { error } = await markAllAsRead(setUnreadCount, refetch);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        {!notifications || notifications.length === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                createdAt={notification.created_at}
                type={notification.type}
                onRead={handleMarkAsRead}
              />
            ))}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};