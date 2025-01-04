import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtistList } from "@/components/admin/ArtistList";
import { ArtworkList } from "@/components/admin/ArtworkList";
import { AdminAnalytics } from "@/components/admin/dashboard/AdminAnalytics";
import { BulkArtworkManager } from "@/components/admin/dashboard/BulkArtworkManager";
import { UserManagement } from "@/components/admin/dashboard/UserManagement";

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
          Manage your artworks, artists, and users
        </p>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="bulk-manager">Bulk Manager</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="artworks" className="mt-6">
          <div className="flex justify-end mb-6">
            <Button onClick={() => navigate("/admin/artwork/new")}>
              <Plus className="mr-2 h-4 w-4" /> New Artwork
            </Button>
          </div>
          <ArtworkList />
        </TabsContent>

        <TabsContent value="bulk-manager" className="mt-6">
          <BulkArtworkManager />
        </TabsContent>

        <TabsContent value="artists" className="mt-6">
          <ArtistList />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;