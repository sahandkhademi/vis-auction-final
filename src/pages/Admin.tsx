import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error("You don't have access to this page");
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  // Fetch artworks with stats
  const { data: artworks, isLoading } = useQuery({
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

  // Delete artwork handler
  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this artwork?");
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Artwork deleted successfully");
      // Refresh the page to update the list
      window.location.reload();
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

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your artworks and monitor their status
          </p>
        </div>
        <Button onClick={() => navigate("/admin/artwork/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Artwork
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Artworks</CardTitle>
          <CardDescription>
            A list of all artworks in your gallery. You can edit, delete, or view
            them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artworks?.map((artwork) => (
                <TableRow key={artwork.id}>
                  <TableCell className="font-medium">{artwork.title}</TableCell>
                  <TableCell>{artwork.artist}</TableCell>
                  <TableCell>
                    ${artwork.starting_price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusBadgeColor(artwork.status || "draft")}
                    >
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;