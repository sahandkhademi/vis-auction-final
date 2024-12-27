import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtistList } from "@/components/admin/ArtistList";
import { ArtworkList } from "@/components/admin/ArtworkList";

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your artworks and artists
        </p>
      </div>

      <Tabs defaultValue="artworks">
        <TabsList>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
        </TabsList>
        <TabsContent value="artworks" className="mt-6">
          <div className="flex justify-end mb-6">
            <Button onClick={() => navigate("/admin/artwork/new")}>
              <Plus className="mr-2 h-4 w-4" /> New Artwork
            </Button>
          </div>
          <ArtworkList />
        </TabsContent>
        <TabsContent value="artists" className="mt-6">
          <ArtistList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;