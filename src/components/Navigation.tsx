import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Navigation = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-serif text-gray-900">
            MOSAIC
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/auctions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Auctions
            </Link>
            <Link to="/buy-selling" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Buy/Selling
            </Link>
            <Link to="/private-sales" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Private sales
            </Link>
            <Link to="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </Button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </Button>
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;