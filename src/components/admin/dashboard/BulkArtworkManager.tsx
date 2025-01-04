import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";

export const BulkArtworkManager = () => {
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("published")}
            disabled={!selectedArtworks.length}
          >
            Publish Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("draft")}
            disabled={!selectedArtworks.length}
          >
            Unpublish Selected
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {selectedArtworks.length} selected
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    artworks?.length === selectedArtworks.length &&
                    artworks?.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks?.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedArtworks.includes(artwork.id)}
                    onCheckedChange={(checked) =>
                      handleSelectArtwork(artwork.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{artwork.title}</TableCell>
                <TableCell>{artwork.artist}</TableCell>
                <TableCell>{artwork.status}</TableCell>
                <TableCell>${artwork.starting_price.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleBulkAction(
                            artwork.status === "published" ? "draft" : "published"
                          )
                        }
                      >
                        {artwork.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};