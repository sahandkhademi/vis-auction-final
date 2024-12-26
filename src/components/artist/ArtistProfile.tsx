import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ArtistProfileProps {
  artist: Tables<"artists">;
}

export const ArtistProfile = ({ artist }: ArtistProfileProps) => {
  return (
    <div className="border-t border-gray-100 pt-8">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
        About the Artist
      </h3>
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16">
          {artist.profile_image_url ? (
            <AvatarImage src={artist.profile_image_url} alt={artist.name} />
          ) : (
            <AvatarFallback>
              <UserRound className="h-8 w-8" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <Link 
            to={`/artist/${artist.id}`}
            className="text-lg font-medium hover:text-blue-600 transition-colors"
          >
            {artist.name}
          </Link>
          <p className="mt-2 text-gray-600 line-clamp-3">{artist.bio}</p>
        </div>
      </div>
    </div>
  );
};