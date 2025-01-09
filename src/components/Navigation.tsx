import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { UserActions } from "./navigation/UserActions";

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/48e1bd0c-6d7a-461c-a150-3037fa8f5f59.png" 
                alt="VIS Auction Logo" 
                className="h-8 w-8 hidden md:block"
              />
              <span className="text-xl font-serif text-gray-900">
                VIS Auction
              </span>
            </Link>
          </div>
          
          <DesktopNav />
          <div className="flex items-center space-x-2">
            <UserActions user={user} setOpen={setOpen} />
            <MobileNav 
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              setOpen={setOpen}
            />
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
                    navigate(`/auction/${artwork.id}`);
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
                    navigate(`/artist/${artist.id}`);
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