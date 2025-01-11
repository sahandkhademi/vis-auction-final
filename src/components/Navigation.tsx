import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigationLinks } from "./navigation/NavigationLinks";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { UserActions } from "./navigation/UserActions";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track page visits
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const sessionId = localStorage.getItem('visitorSession') || crypto.randomUUID();
        localStorage.setItem('visitorSession', sessionId);

        const { data, error } = await supabase.rpc('track_website_visit', {
          p_session_id: sessionId,
          p_path: location.pathname,
          p_user_agent: navigator.userAgent
        });

        if (error) {
          console.error('Error recording visit:', error);
        } else {
          console.log('Visit recorded successfully:', data);
        }
      } catch (err) {
        console.error('Failed to record visit:', err);
      }
    };

    recordVisit();
  }, [location.pathname]);

  const { data: searchResults } = useQuery({
    queryKey: ["search-results"],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data: artworks, error } = await supabase
        .from("artworks")
        .select("id, title, artist, image_url")
        .ilike("title", `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      return artworks;
    },
    enabled: searchQuery.length > 0,
  });

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>("#search-input")?.focus();
      }, 100);
    }
  };

  const handleSearchSelect = (id: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(`/auctions/${id}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a
            className="mr-6 flex items-center space-x-2"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <img
              src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png"
              alt="VIS Logo"
              className="h-6 w-6"
            />
            <span className="hidden font-bold sm:inline-block">
              VIS Auction
            </span>
          </a>
          <DesktopNav items={navigationLinks} />
        </div>
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <button
              onClick={handleSearchClick}
              className={cn(
                "inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
                isSearchOpen && "hidden md:inline-flex"
              )}
            >
              <span className="hidden lg:inline-flex">
                Search artworks...
              </span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          <UserActions />
        </div>
      </div>

      {isSearchOpen && (
        <div className="container">
          <div className="relative">
            <Input
              id="search-input"
              className="w-full"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                <ScrollArea className="max-h-[300px]">
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <div key={result.id}>
                        <button
                          className="w-full rounded-md p-2 text-left hover:bg-[#00337F] hover:text-white"
                          onClick={() => handleSearchSelect(result.id)}
                        >
                          <div className="text-sm font-medium">
                            {result.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.artist}
                          </div>
                        </button>
                        <Separator className="my-1" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;