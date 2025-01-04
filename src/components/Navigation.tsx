import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SearchResults } from "@/types/search";
import { NavigationMenu } from "./navigation/NavigationMenu";
import { SearchDialog } from "./navigation/SearchDialog";
import { UserMenu } from "./navigation/UserMenu";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: searchResults } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;

      const [artworksResponse, artistsResponse] = await Promise.all([
        supabase
          .from("artworks")
          .select("id, title, artist")
          .ilike("title", `%${searchQuery}%`)
          .limit(5),
        supabase
          .from("artists")
          .select("id, name")
          .ilike("name", `%${searchQuery}%`)
          .limit(5),
      ]);

      return {
        artworks: artworksResponse.data || [],
        artists: artistsResponse.data || [],
      } as SearchResults;
    },
    enabled: searchQuery.length > 0,
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-12">
            <Link
              to="/"
              className={cn(
                "text-xl font-serif",
                isScrolled ? "text-gray-900" : "text-white"
              )}
            >
              VIS Auction
            </Link>
            <NavigationMenu isScrolled={isScrolled} />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon" 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <SearchDialog 
        open={open}
        setOpen={setOpen}
        searchResults={searchResults}
      />
    </header>
  );
};

export default Navigation;