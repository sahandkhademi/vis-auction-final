import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

export const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.length);
    }
  }, [notifications]);

  const markAsRead = async (id: string, type: string, entityId?: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
      
    if (!error) {
      refetch();
      
      // Navigate based on notification type
      if (entityId) {
        switch (type) {
          case 'auction_won':
          case 'outbid':
          case 'auction_expired':
            navigate(`/auctions/${entityId}`);
            break;
          case 'payment_success':
            navigate(`/profile`);
            break;
          default:
            // For unknown types, just mark as read without navigation
            break;
        }
      }
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

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
      refetch();
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    } else {
      refetch();
    }
  };

  const handleDragEnd = async (
    info: PanInfo,
    notification: { id: string }
  ) => {
    const SWIPE_THRESHOLD = -50;
    if (info.offset.x < SWIPE_THRESHOLD) {
      await deleteNotification(notification.id);
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
            {notifications?.map((notification) => {
              const entityId = notification.message.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)?.[0];
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => handleDragEnd(info, notification)}
                  className="relative"
                >
                  <DropdownMenuItem
                    className="flex flex-col items-start p-4 space-y-1 cursor-pointer"
                    onClick={() => markAsRead(notification.id, notification.type, entityId)}
                  >
                    <div className="font-semibold">{notification.title}</div>
                    <div className="text-sm text-gray-500">{notification.message}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                  </DropdownMenuItem>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Trash2 className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};