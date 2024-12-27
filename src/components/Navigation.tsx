import { Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { NotificationList } from "./notifications/NotificationList";

export const Navigation = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="font-medium">
            Art Auctions
          </Link>
          <Link to="/auctions" className="text-gray-600 hover:text-gray-900">
            Browse
          </Link>
          {session && (
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <NotificationList />
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};