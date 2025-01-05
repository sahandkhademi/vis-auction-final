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
import { BackupMonitoring } from "@/components/admin/dashboard/BackupMonitoring";
import { WinnersManagement } from "@/components/admin/dashboard/WinnersManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <Monitor className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl mb-2">Desktop View Required</h1>
        <p className="text-muted-foreground">
          The admin dashboard is optimized for desktop viewing. Please access it from a larger screen for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your gallery's artworks, artists, and operations
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <Card>
          <CardContent className="pt-6 pb-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 min-h-[88px]">
              <TabsTrigger value="analytics" className="w-full">Analytics</TabsTrigger>
              <TabsTrigger value="artworks" className="w-full">Artworks</TabsTrigger>
              <TabsTrigger value="artists" className="w-full">Artists</TabsTrigger>
              <TabsTrigger value="winners" className="w-full">Winners</TabsTrigger>
              <TabsTrigger value="users" className="w-full">Users</TabsTrigger>
              <TabsTrigger value="bulk" className="w-full">Bulk Manager</TabsTrigger>
              <TabsTrigger value="backups" className="w-full">Backups</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artworks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Artwork Management</CardTitle>
              <Button onClick={() => navigate("/admin/artwork/new")}>
                <Plus className="mr-2 h-4 w-4" /> New Artwork
              </Button>
            </CardHeader>
            <CardContent>
              <ArtworkList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Artwork Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkArtworkManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <Card>
            <CardHeader>
              <CardTitle>Artist Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ArtistList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle>Winner Management</CardTitle>
            </CardHeader>
            <CardContent>
              <WinnersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BackupMonitoring />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;