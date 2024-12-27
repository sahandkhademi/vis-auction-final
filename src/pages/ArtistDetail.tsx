import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import AuctionCard from "@/components/AuctionCard";

const ArtistDetail = () => {
  const { id } = useParams();

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery({
    queryKey: ['artist-artworks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingArtist || isLoadingArtworks) {
    return <div className="min-h-screen pt-20 text-center">Loading...</div>;
  }

  if (!artist) {
    return <div className="min-h-screen pt-20 text-center">Artist not found</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="py-12">
          <div className="flex items-start gap-8">
            <Avatar className="h-24 w-24">
              {artist.profile_image_url ? (
                <AvatarImage src={artist.profile_image_url} alt={artist.name} />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif text-gray-900">{artist.name}</h1>
              <p className="mt-4 text-gray-600 max-w-2xl">{artist.bio}</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-serif text-gray-900 mb-8">Artworks by {artist.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks?.map((artwork) => (
                <AuctionCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  image={artwork.image_url}
                  currentBid={artwork.current_price}
                  endDate={artwork.end_date}
                  category="auction"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;