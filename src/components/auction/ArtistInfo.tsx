import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ArtistInfoProps {
  name: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  artistId?: string;
  large?: boolean;
}

export const ArtistInfo = ({ name, bio, profileImageUrl, artistId, large }: ArtistInfoProps) => {
  console.log('ArtistInfo props:', { name, bio, profileImageUrl }); // Debug log

  const avatarSize = large ? "h-24 w-24" : "h-12 w-12";
  const userIconSize = large ? "h-12 w-12" : "h-6 w-6";

  return (
    <div className="border-t border-gray-100 pt-8 pb-8">
      {!large && (
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
          About the Artist
        </h3>
      )}
      <div className="flex items-start gap-4">
        <Avatar className={avatarSize}>
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={name} />
          ) : (
            <AvatarFallback>
              <User className={`${userIconSize} text-gray-400`} />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          {artistId ? (
            <Link to={`/artist/${artistId}`} className="hover:underline">
              <h4 className={`font-medium text-gray-900 ${large ? "text-2xl" : ""}`}>{name}</h4>
            </Link>
          ) : (
            <h4 className={`font-medium text-gray-900 ${large ? "text-2xl" : ""}`}>{name}</h4>
          )}
          <p className={`mt-1 text-gray-500 ${large ? "text-lg" : "text-sm"} ${large ? "" : "line-clamp-2"}`}>
            {bio || "No artist biography available."}
          </p>
        </div>
      </div>
    </div>
  );
};