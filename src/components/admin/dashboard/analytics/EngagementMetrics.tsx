import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const EngagementMetrics = () => {
  const { data: userEngagement } = useQuery({
    queryKey: ["userEngagement"],
    queryFn: async () => {
      const currentDate = new Date();
      const previousMonth = subMonths(currentDate, 1);
      
      const { data: viewsData } = await supabase
        .from("artwork_views")
        .select("id")
        .gte("viewed_at", startOfMonth(previousMonth).toISOString())
        .lte("viewed_at", endOfMonth(currentDate).toISOString());

      const { data: bidsData } = await supabase
        .from("bids")
        .select("created_at")
        .gte("created_at", startOfMonth(previousMonth).toISOString())
        .lte("created_at", endOfMonth(currentDate).toISOString());

      const views = viewsData?.length || 0;
      const bids = bidsData?.length || 0;
      const conversionRate = views > 0 ? ((bids / views) * 100).toFixed(1) : 0;

      return {
        views,
        bids,
        conversionRate,
      };
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Views</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userEngagement?.views || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Bids</CardTitle>
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