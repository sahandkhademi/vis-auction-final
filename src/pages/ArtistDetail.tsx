import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCard } from "@/components/AuctionCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

const ArtistDetail = () => {
  const { id } = useParams();

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery({
    queryKey: ["artist-artworks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("artist_id", id)
        .eq("status", "published");

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingArtist || isLoadingArtworks) {
    return <div className="min-h-screen pt-20">Loading...</div>;
  }

  if (!artist) {
    return <div className="min-h-screen pt-20">Artist not found</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 mb-12">
          <Avatar className="h-24 w-24">
            {artist.profile_image_url ? (
              <AvatarImage src={artist.profile_image_url} alt={artist.name} />
            ) : (
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-light">{artist.name}</h1>
            <p className="mt-4 text-gray-600 max-w-2xl">{artist.bio}</p>
          </div>
        </div>

        <h2 className="text-2xl font-light mb-8">Available Works</h2>
        {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((artwork) => (
              <AuctionCard
                key={artwork.id}
                id={artwork.id}
                title={artwork.title}
                artist={artwork.artist}
                image={artwork.image_url || '/placeholder.svg'}
                currentBid={artwork.current_price || artwork.starting_price}
                category={artwork.format || 'Art'}
                endDate={artwork.end_date}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No artworks currently available.</p>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;