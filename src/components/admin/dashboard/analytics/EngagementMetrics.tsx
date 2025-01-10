import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const EngagementMetrics = () => {
  const { data: userEngagement } = useQuery({
    queryKey: ["userEngagement"],
    queryFn: async () => {
      const currentDate = new Date();
      const thirtyDaysAgo = startOfDay(subDays(currentDate, 30));
      
      console.log("Fetching views from:", thirtyDaysAgo, "to:", currentDate);
      
      // Get unique website visitors
      const { data: visitsData, error: visitsError } = await supabase
        .from("website_visits")
        .select('visitor_id, session_id')
        .gte("visited_at", thirtyDaysAgo.toISOString())
        .lte("visited_at", currentDate.toISOString());

      if (visitsError) {
        console.error("Error fetching visits:", visitsError);
      }

      // Count unique visitors by combining user visits and session visits
      const uniqueVisitors = new Set();
      visitsData?.forEach(visit => {
        if (visit.visitor_id) {
          uniqueVisitors.add(`user_${visit.visitor_id}`);
        } else if (visit.session_id) {
          uniqueVisitors.add(`session_${visit.session_id}`);
        }
      });
      
      console.log("Unique visitors count:", uniqueVisitors.size);

      // Get artwork views
      const { data: viewsData, error: viewsError } = await supabase
        .from("artwork_views")
        .select('viewer_id, session_id')
        .gte("viewed_at", thirtyDaysAgo.toISOString())
        .lte("viewed_at", currentDate.toISOString());

      if (viewsError) {
        console.error("Error fetching artwork views:", viewsError);
      }

      // Count unique artwork views
      const uniqueArtworkViews = new Set();
      viewsData?.forEach(view => {
        if (view.viewer_id) {
          uniqueArtworkViews.add(`user_${view.viewer_id}`);
        } else if (view.session_id) {
          uniqueArtworkViews.add(`session_${view.session_id}`);
        }
      });

      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .lte("created_at", currentDate.toISOString());

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
      }

      const visitors = uniqueVisitors.size;
      const artworkViews = uniqueArtworkViews.size;
      const bids = bidsData?.length || 0;
      const conversionRate = artworkViews > 0 ? ((bids / artworkViews) * 100).toFixed(1) : "0";

      return {
        visitors,
        artworkViews,
        bids,
        conversionRate,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Visitors</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.visitors || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Artwork Views</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.artworkViews || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Bids</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.bids || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
          <CardDescription>Views to Bids</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.conversionRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
};