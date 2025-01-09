import { lazy, Suspense } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Lazy loaded components
const AdminAnalytics = lazy(() => import("./analytics/AdminAnalytics"));
const ArtworkManagement = lazy(() => import("./artwork/ArtworkManagement"));
const ArtistManagement = lazy(() => import("./artists/ArtistManagement"));
const BannerManagement = lazy(() => import("./banners/BannerManagement"));
const UserManagement = lazy(() => import("./users/UserManagement"));
const BackupMonitoring = lazy(() => import("./backup/BackupMonitoring"));
const WinnersManagement = lazy(() => import("./winners/WinnersManagement"));

const LoadingFallback = () => (
  <div className="space-y-4 p-8">
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-[200px] w-full" />
  </div>
);

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
        <h1 className="text-2xl font-bold mb-2">Desktop View Required</h1>
        <p className="text-muted-foreground">
          The admin dashboard is optimized for desktop viewing. Please access it from a larger screen for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
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
              <Suspense fallback={<LoadingFallback />}>
                <AdminAnalytics />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingFallback />}>
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="artworks" className="border rounded-lg">
                    <AccordionTrigger className="px-4">
                      <div className="flex justify-between items-center w-full">
                        <span>Artworks</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ArtworkManagement navigate={navigate} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="artists" className="border rounded-lg">
                    <AccordionTrigger className="px-4">Artists</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ArtistManagement />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="banners" className="border rounded-lg">
                    <AccordionTrigger className="px-4">Banners</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <BannerManagement />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle>Winner Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingFallback />}>
                <WinnersManagement />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingFallback />}>
                <UserManagement />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Suspense fallback={<LoadingFallback />}>
            <BackupMonitoring />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;