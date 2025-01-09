import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArtworkList } from "@/components/admin/ArtworkList";
import { BulkArtworkManager } from "@/components/admin/dashboard/BulkArtworkManager";

interface ArtworkManagementProps {
  navigate: (path: string) => void;
}

const ArtworkManagement = ({ navigate }: ArtworkManagementProps) => {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate("/admin/artwork/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Artwork
        </Button>
      </div>
      <ArtworkList />
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Bulk Operations</h3>
        <BulkArtworkManager />
      </div>
    </>
  );
};

export default ArtworkManagement;