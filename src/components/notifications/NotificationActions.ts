import { supabase } from "@/integrations/supabase/client";

export const markAsRead = async (
  id: string,
  type: string,
  entityId: string | undefined,
  setUnreadCount: (count: number | ((prev: number) => number)) => void
) => {
  console.log('🔄 Marking notification as read:', id);
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
    
  if (!error) {
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  } else {
    console.error('❌ Error marking notification as read:', error);
  }
  
  return { error, entityId, type };
};

export const markAllAsRead = async (
  setUnreadCount: (count: number) => void,
  refetch: () => Promise<any>
) => {
  console.log('🔄 Marking all notifications as read');
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (!error) {
    setUnreadCount(0);
    await refetch();
  }
  
  return { error };
};