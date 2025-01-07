import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

export const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log('🔄 Fetching notifications');
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }
      console.log('✅ Notifications fetched:', data);
      return data || [];
    },
  });

  // Set up real-time subscription for notifications with immediate state updates
  useEffect(() => {
    console.log('🔄 Setting up notification subscription');
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('📥 New notification received:', payload);
          // Immediately update the unread count for new notifications
          setUnreadCount(prevCount => prevCount + 1);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload: any) => {
          console.log('🔄 Notification updated:', payload);
          // If a notification is marked as read, decrease the count
          if (payload.old.read === false && payload.new.read === true) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        (payload: any) => {
          console.log('🗑️ Notification deleted:', payload);
          // If an unread notification is deleted, decrease the count
          if (!payload.old.read) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          refetch();
        }
      )
      .subscribe(status => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Initialize unread count from fetched data
  useEffect(() => {
    if (notifications) {
      console.log('🔄 Updating unread count:', notifications.length);
      setUnreadCount(notifications.length);
    }
  }, [notifications]);

  const markAsRead = async (id: string, type: string, entityId?: string) => {
    console.log('🔄 Marking notification as read:', id);
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
      
    if (!error) {
      // Immediately update the local state
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      // Navigate based on notification type
      if (entityId) {
        switch (type) {
          case 'auction_won':
          case 'outbid':
          case 'auction_expired':
            navigate(`/auction/${entityId}`);
            break;
          case 'payment_success':
            navigate(`/profile`);
            break;
          default:
            // For unknown types, just mark as read without navigation
            break;
        }
      }
    } else {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    console.log('🔄 Marking all notifications as read');
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (error) {
      console.error('❌ Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    } else {
      console.log('✅ All notifications marked as read');
      setUnreadCount(0); // Immediately update the local state
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      refetch();
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
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        {notifications?.length === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          <AnimatePresence initial={false}>
            {notifications?.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                createdAt={notification.created_at}
                type={notification.type}
                onRead={markAsRead}
              />
            ))}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};