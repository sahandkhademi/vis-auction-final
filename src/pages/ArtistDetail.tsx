import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { AuctionCard } from "@/components/AuctionCard";
import { useEffect } from "react";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Validate ID and redirect if invalid
  useEffect(() => {
    if (!id || !UUID_REGEX.test(id)) {
      navigate("/");
    }
  }, [id, navigate]);

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      if (!id || !UUID_REGEX.test(id)) throw new Error('Invalid artist ID');
      
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Artist not found');
      return data;
    },
    enabled: !!id && UUID_REGEX.test(id),
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery({
    queryKey: ['artist-artworks', id],
    queryFn: async () => {
      if (!id || !UUID_REGEX.test(id)) throw new Error('Invalid artist ID');
      
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id && UUID_REGEX.test(id),
  });

  if (!id || !UUID_REGEX.test(id)) {
    return null; // Will be redirected by useEffect
  }

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
          <div className="block md:flex md:items-start md:gap-8">
            <div className="flex flex-col items-center md:block mb-6 md:mb-0">
              <Avatar className="h-24 w-24">
                {artist.profile_image_url ? (
                  <AvatarImage src={artist.profile_image_url} alt={artist.name} />
                ) : (
                  <AvatarFallback>
                    <User className="h-12 w-12 text-gray-400" />
                  </AvatarFallback>
                )}
              </Avatar>
              <h1 className="text-3xl text-gray-900 mt-4 md:mt-0">{artist.name}</h1>
            </div>
            <p className="text-gray-600 max-w-2xl text-center md:text-left">{artist.bio}</p>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl text-gray-900 mb-8">Artworks by {artist.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks?.map((artwork) => (
                <AuctionCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artist.name}
                  artist_id={artist.id}
                  image={artwork.image_url}
                  currentBid={artwork.current_price || artwork.starting_price}
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