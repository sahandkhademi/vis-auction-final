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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BannerList } from "@/components/admin/BannerList";

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
          Manage your gallery's content and operations
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <Card>
          <CardContent className="pt-6 pb-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 min-h-[44px]">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="winners">Winners</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
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

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="artworks" className="border rounded-lg">
                  <AccordionTrigger className="px-4">
                    <div className="flex justify-between items-center w-full">
                      <span>Artworks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="artists" className="border rounded-lg">
                  <AccordionTrigger className="px-4">Artists</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ArtistList />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="banners" className="border rounded-lg">
                  <AccordionTrigger className="px-4">Banners</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <BannerList />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

        <TabsContent value="backups">
          <BackupMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;