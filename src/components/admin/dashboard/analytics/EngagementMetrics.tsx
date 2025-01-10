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
      
      // Get unique views by combining unique viewer_ids and session_ids
      const { data: viewsData, error: viewsError } = await supabase
        .from("artwork_views")
        .select('viewer_id, session_id')
        .gte("viewed_at", thirtyDaysAgo.toISOString())
        .lte("viewed_at", currentDate.toISOString());

      if (viewsError) {
        console.error("Error fetching views:", viewsError);
      }

      // Count unique views by combining user views and session views
      const uniqueViews = new Set();
      viewsData?.forEach(view => {
        if (view.viewer_id) {
          uniqueViews.add(`user_${view.viewer_id}`);
        } else if (view.session_id) {
          uniqueViews.add(`session_${view.session_id}`);
        }
      });
      
      console.log("Unique views count:", uniqueViews.size);

      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .lte("created_at", currentDate.toISOString());

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
      }

      const views = uniqueViews.size;
      const bids = bidsData?.length || 0;
      const conversionRate = views > 0 ? ((bids / views) * 100).toFixed(1) : "0";

      return {
        views,
        bids,
        conversionRate,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Unique Views</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.views || 0}</p>
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