import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArtistInfo } from "@/components/auction/ArtistInfo";
import { AuctionCard } from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        .order("created_at", { ascending: false });

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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <ArtistInfo
            name={artist.name}
            bio={artist.bio}
            profileImageUrl={artist.profile_image_url}
            large
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Artworks by {artist.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks?.map((artwork) => (
            <AuctionCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              artist={artwork.artist}
              image={artwork.image_url}
              currentBid={artwork.current_price || artwork.starting_price}
              category={artwork.format || ""}
              endDate={artwork.end_date}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;