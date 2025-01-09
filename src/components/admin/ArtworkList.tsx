import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableVirtuoso } from "react-virtuoso";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const ArtworkList = () => {
  const navigate = useNavigate();

  const { data: artworks, refetch } = useQuery({
    queryKey: ["admin-artworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this artwork?"
    );
    if (!confirmation) return;

    try {
      const { error } = await supabase.from("artworks").delete().eq("id", id);

      if (error) throw error;
      toast.success("Artwork deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast.error("Failed to delete artwork");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "sold":
        return "bg-blue-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const TableHeader = () => (
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Artist</TableHead>
      <TableHead>Price</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Created</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  );

  const TableRowContent = (index: number) => {
    const artwork = artworks?.[index];
    if (!artwork) return null;

    return (
      <TableRow>
        <TableCell className="font-medium">{artwork.title}</TableCell>
        <TableCell>{artwork.artist}</TableCell>
        <TableCell>${artwork.starting_price.toLocaleString()}</TableCell>
        <TableCell>
          <Badge className={getStatusBadgeColor(artwork.status || "draft")}>
            {artwork.status || "draft"}
          </Badge>
        </TableCell>
        <TableCell>
          {new Date(artwork.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/artwork/${artwork.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/admin/artwork/${artwork.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(artwork.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="relative">
      <div style={{ height: "600px" }}>
        <TableVirtuoso
          data={artworks || []}
          components={{
            Table: ({ style, ...props }) => (
              <Table {...props} />
            ),
            TableHead: TableHeader,
            TableRow: ({ children, ...props }) => (
              <TableRow {...props}>{children}</TableRow>
            ),
          }}
          fixedHeaderContent={() => <TableHeader />}
          itemContent={(_, index) => TableRowContent(index)}
        />
      </div>
    </div>
  );
};