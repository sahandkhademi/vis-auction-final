import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SearchResults } from "@/types/search";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchResults?: SearchResults;
}

export const SearchDialog = ({ open, setOpen, searchResults }: SearchDialogProps) => {
  const navigate = useNavigate();

  return (
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
  );
};