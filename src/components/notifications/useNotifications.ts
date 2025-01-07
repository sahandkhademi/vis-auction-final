import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.length);
    }
  }, [notifications]);

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
        (payload: any) => {
          console.log('📥 New notification received:', payload);
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
          if (!payload.old.read) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { notifications, unreadCount, setUnreadCount, refetch };
};