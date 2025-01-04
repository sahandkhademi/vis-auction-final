import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { NotificationBadge } from "./notifications/NotificationBadge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navigation = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const { data: searchResults } = useQuery({
    queryKey: ["search-results"],
    queryFn: async () => {
      const { data: artworks } = await supabase
        .from("artworks")
        .select("id, title, artist")
        .eq("status", "published");

      const { data: artists } = await supabase
        .from("artists")
        .select("id, name");

      return {
        artworks: artworks || [],
        artists: artists || [],
      };
    },
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigationLinks = [
    { to: "/auctions", label: "Auctions" },
    { to: "/submit-art", label: "Submit Your Art" },
    { to: "/faq", label: "FAQ" },
    { to: "/about", label: "About Us" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-serif text-gray-900">
            VIS Auction
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 mt-6">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBadge />
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900" aria-label="Profile">
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
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        aria-label="Search dialog"
      >
        <CommandInput 
          placeholder="Search artworks and artists..." 
          aria-label="Search input"
        />
        <CommandList aria-label="Search results">
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults?.artworks && searchResults.artworks.length > 0 && (
            <CommandGroup heading="Artworks">
              {searchResults.artworks.map((artwork) => (
                <CommandItem
                  key={artwork.id}
                  onSelect={() => {
                    navigate(`/auctions/${artwork.id}`);
                    setOpen(false);
                  }}
                  role="option"
                >
                  {artwork.title} by {artwork.artist}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {searchResults?.artists && searchResults.artists.length > 0 && (
            <CommandGroup heading="Artists">
              {searchResults.artists.map((artist) => (
                <CommandItem
                  key={artist.id}
                  onSelect={() => {
                    navigate(`/artists/${artist.id}`);
                    setOpen(false);
                  }}
                  role="option"
                >
                  {artist.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </nav>
  );
};

export default Navigation;