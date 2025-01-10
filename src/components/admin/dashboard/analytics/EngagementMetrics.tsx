import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const EngagementMetrics = () => {
  const { data: userEngagement } = useQuery({
    queryKey: ["userEngagement"],
    queryFn: async () => {
      const currentDate = new Date();
      const startDate = startOfMonth(subMonths(currentDate, 1));
      const endDate = endOfMonth(currentDate);
      
      console.log("Fetching views from:", startDate, "to:", endDate);
      
      const { data: viewsData, error: viewsError } = await supabase
        .from("artwork_views")
        .select("*")
        .gte("viewed_at", startDate.toISOString())
        .lte("viewed_at", endDate.toISOString());

      if (viewsError) {
        console.error("Error fetching views:", viewsError);
      }
      console.log("Views data:", viewsData);

      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
      }
      console.log("Bids data:", bidsData);

      const views = viewsData?.length || 0;
      const bids = bidsData?.length || 0;
      const conversionRate = views > 0 ? ((bids / views) * 100).toFixed(1) : 0;

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
          <CardTitle>Monthly Views</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.views || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Bids</CardTitle>
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
          <p className="text-3xl font-bold">{userEngagement?.conversionRate || 0}%</p>
        </CardContent>
      </Card>
    </div>
  );
};