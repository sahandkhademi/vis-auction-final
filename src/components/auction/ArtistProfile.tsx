import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtistProfileProps {
  id: string;
  name: string;
  bio?: string | null;
  profileImageUrl?: string | null;
}

export const ArtistProfile = ({ id, name, bio, profileImageUrl }: ArtistProfileProps) => {
  return (
    <div className="border-t border-gray-100 pt-8">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
        About the Artist
      </h3>
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profileImageUrl || undefined} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <Link 
            to={`/artist/${id}`}
            className="text-lg font-medium hover:text-blue-600 transition-colors"
          >
            {name}
          </Link>
          {bio && <p className="mt-2 text-gray-600 text-sm">{bio}</p>}
        </div>
      </div>
    </div>
  );
};