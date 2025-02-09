import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LayoutGrid } from "lucide-react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserActionsProps {
  user: SupabaseUser | null;
  setOpen: (open: boolean) => void;
}

export const UserActions = ({ user, setOpen }: UserActionsProps) => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-gray-600 hover:text-gray-900 md:flex hidden"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>
      {user ? (
        <div className="flex items-center space-x-2">
          {!isLoading && profile?.is_admin && (
            <Link to="/admin" className="hidden md:block">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-gray-900"
                aria-label="Admin Dashboard"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </Link>
          )}
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
      ) : (
        <Button 
          variant="ghost" 
          onClick={() => navigate("/auth")}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign in
        </Button>
      )}
    </div>
  );
};