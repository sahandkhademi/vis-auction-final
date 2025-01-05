import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtistInfoProps {
  name: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  artistId?: string;
}

export const ArtistInfo = ({ name, bio, profileImageUrl, artistId }: ArtistInfoProps) => {
  return (
    <div className="border-t border-gray-100 pt-8 pb-8">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
        About the Artist
      </h3>
      <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
        <Avatar className="h-12 w-12">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={name} />
          ) : (
            <AvatarFallback>
              <User className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-center md:text-left">
          <Link to={`/artist/${artistId}`}>
            <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
              {name}
            </h4>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {bio || "No artist biography available."}
          </p>
        </div>
      </div>
    </div>
  );
};