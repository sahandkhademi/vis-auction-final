import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BulkActionButtons } from "./bulk-artwork/BulkActionButtons";
import { BulkArtworkTable } from "./bulk-artwork/BulkArtworkTable";
import { DeleteConfirmDialog } from "./bulk-artwork/DeleteConfirmDialog";

export const BulkArtworkManager = () => {
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: artworks, refetch } = useQuery({
    queryKey: ["admin-artworks-bulk"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArtworks(artworks?.map((artwork) => artwork.id) || []);
    } else {
      setSelectedArtworks([]);
    }
  };

  const handleSelectArtwork = (artworkId: string, checked: boolean) => {
    if (checked) {
      setSelectedArtworks([...selectedArtworks, artworkId]);
    } else {
      setSelectedArtworks(selectedArtworks.filter((id) => id !== artworkId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedArtworks.length) {
      toast.error("Please select artworks first");
      return;
    }

    try {
      const { error } = await supabase
        .from("artworks")
        .update({ status: action })
        .in("id", selectedArtworks);

      if (error) throw error;

      toast.success(`${selectedArtworks.length} artworks updated successfully`);
      setSelectedArtworks([]);
      refetch();
    } catch (error) {
      console.error("Error updating artworks:", error);
      toast.error("Failed to update artworks");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedArtworks.length) {
      toast.error("Please select artworks first");
      return;
    }

    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .in("id", selectedArtworks);

      if (error) throw error;

      toast.success(`${selectedArtworks.length} artworks deleted successfully`);
      setSelectedArtworks([]);
      setShowDeleteDialog(false);
      refetch();
    } catch (error) {
      console.error("Error deleting artworks:", error);
      toast.error("Failed to delete artworks");
    }
  };

  return (
    <div className="space-y-4">
      <BulkActionButtons
        selectedCount={selectedArtworks.length}
        onPublish={() => handleBulkAction("published")}
        onUnpublish={() => handleBulkAction("draft")}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <BulkArtworkTable
        artworks={artworks}
        selectedArtworks={selectedArtworks}
        onSelectAll={handleSelectAll}
        onSelectArtwork={handleSelectArtwork}
        onStatusChange={(id, status) => handleBulkAction(status)}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedCount={selectedArtworks.length}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
};