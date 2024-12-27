import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtistInfoProps {
  name: string;
  bio?: string | null;
  profileImageUrl?: string | null;
}

export const ArtistInfo = ({ name, bio, profileImageUrl }: ArtistInfoProps) => {
  console.log('ArtistInfo props:', { name, bio, profileImageUrl }); // Debug log

  return (
    <div className="border-t border-gray-100 pt-8 pb-8">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
        About the Artist
      </h3>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={name} />
          ) : (
            <AvatarFallback>
              <User className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {bio || "No artist biography available."}
          </p>
        </div>
      </div>
    </div>
  );
};