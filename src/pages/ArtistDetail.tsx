import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuctionCard } from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        .eq('artist_id', id)
        .eq('status', 'published');

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingArtist || isLoadingArtworks) {
    return <div className="min-h-screen bg-white pt-20 text-center">Loading...</div>;
  }

  if (!artist) {
    return <div className="min-h-screen bg-white pt-20 text-center">Artist not found</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-600 hover:text-gray-900 -ml-4"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>

        <div className="flex items-start gap-8 mb-12">
          <Avatar className="h-32 w-32">
            <AvatarImage src={artist.profile_image_url || undefined} alt={artist.name} />
            <AvatarFallback>{artist.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-light mb-4">{artist.name}</h1>
            {artist.bio && <p className="text-gray-600 max-w-2xl">{artist.bio}</p>}
          </div>
        </div>

        {artworks && artworks.length > 0 ? (
          <div>
            <h2 className="text-2xl font-light mb-8">Available Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <AuctionCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  image={artwork.image_url}
                  currentBid={artwork.current_price || artwork.starting_price}
                  endDate={artwork.end_date}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No artworks available</p>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;