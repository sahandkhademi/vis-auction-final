import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Edit, Trash2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArtistForm } from "./ArtistForm";
import { toast } from "sonner";

export const ArtistList = () => {
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: artists, refetch } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this artist?");
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from("artists")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Artist deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast.error("Failed to delete artist");
    }
  };

  const handleEdit = (artist: any) => {
    setSelectedArtist(artist);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedArtist(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Artists</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Artist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artists?.map((artist) => (
          <div
            key={artist.id}
            className="p-4 border rounded-lg space-y-4 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={artist.profile_image_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{artist.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {artist.bio || "No biography available"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(artist)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(artist.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedArtist ? "Edit Artist" : "Create Artist"}
            </DialogTitle>
          </DialogHeader>
          <ArtistForm
            defaultValues={selectedArtist}
            artistId={selectedArtist?.id}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};