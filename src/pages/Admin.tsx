import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

  // Fetch artworks
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

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Admin Dashboard</h1>
        <Button onClick={() => navigate("/admin/artwork/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Artwork
        </Button>
      </div>

      <div className="grid gap-6">
        {artworks?.map((artwork) => (
          <div
            key={artwork.id}
            className="border p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{artwork.title}</h3>
              <p className="text-sm text-gray-500">{artwork.artist}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/artwork/${artwork.id}`)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;