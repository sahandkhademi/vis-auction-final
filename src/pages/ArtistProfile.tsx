import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuctionCard } from "@/components/AuctionCard";

const ArtistProfile = () => {
  const { id } = useParams();

  // Mock artist data - in a real app, this would come from an API
  const artist = {
    id: parseInt(id || "1"),
    name: "Digital Artist X",
    bio: "A contemporary digital artist known for pushing the boundaries of digital art and exploring themes of technology and human connection.",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    otherWorks: [
      {
        id: 1,
        title: "Digital Dreams",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        currentBid: 3000,
        timeLeft: "2d 15h",
        category: "Digital Art"
      },
      {
        id: 2,
        title: "Cyber Sunset",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
        currentBid: 4500,
        timeLeft: "3d 8h",
        category: "Digital Art"
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={artist.profileImage} alt={artist.name} />
            <AvatarFallback>{artist.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
            <p className="text-gray-600">{artist.bio}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Other Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artist.otherWorks.map((work) => (
                <AuctionCard key={work.id} {...work} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;