import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  status: string;
  starting_price: number;
}

interface BulkArtworkTableProps {
  artworks: Artwork[] | null;
  selectedArtworks: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectArtwork: (artworkId: string, checked: boolean) => void;
  onStatusChange: (artworkId: string, newStatus: string) => void;
}

export const BulkArtworkTable = ({
  artworks,
  selectedArtworks,
  onSelectAll,
  onSelectArtwork,
  onStatusChange,
}: BulkArtworkTableProps) => {
  return (
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
                onCheckedChange={(checked: boolean) => onSelectAll(checked)}
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
                  onCheckedChange={(checked: boolean) =>
                    onSelectArtwork(artwork.id, checked)
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
                        onStatusChange(
                          artwork.id,
                          artwork.status === "published" ? "draft" : "published"
                        )
                      }
                    >
                      {artwork.status === "published" ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};