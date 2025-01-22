import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementMetrics = () => {
  const { data: retentionData } = useQuery({
    queryKey: ["user-retention-trend"],
    queryFn: async () => {
      console.log("Fetching retention data...");
      const { data, error } = await supabase
        .from("website_visits")
        .select('visited_at, ip_address, visitor_id')
        .gte('visited_atLet me help fix the TypeScript errors in the EngagementMetrics component. The issue is with the type definitions for the dailyStats object.

<lov-code>
Let's update the EngagementMetrics.tsx file:

<lov-write file_path="src/components/admin/dashboard/analytics/EngagementMetrics.tsx">
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementMetrics = () => {
  const { data: retentionData } = useQuery({
    queryKey: ["user-retention-trend"],
    queryFn: async () => {
      console.log("Fetching retention data...");
      const { data, error } = await supabase
        .from("website_visits")
        .select('visited_at, ip_address, visitor_id')
        .gte('visited_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error("Error fetching retention data:", error);
        throw error;
      }

      console.log("Raw visit data:", data);

      // Group by day and count unique IPs and visitors
      const dailyStats = data.reduce((acc: { [key: string]: { unique: Set<string>, registered: Set<string> } }, visit) => {
        const day = new Date(visit.visited_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (!acc[day]) {
          acc[day] = { unique: new Set<string>(), registered: new Set<string>() };
        }
        if (visit.ip_address) acc[day].unique.add(visit.ip_address);
        if (visit.visitor_id) acc[day].registered.add(visit.visitor_id);
        return acc;
      }, {});

      // Convert sets to counts
      return Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        unique: stats.unique.size,
        registered: stats.registered.size
      }));
    },
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>User Engagement</CardTitle>
        <CardDescription>Daily unique visitors (by IP) over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="unique" name="Unique Visitors" fill="#00337F" />
              <Bar dataKey="registered" name="Registered Users" fill="#00337F" fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};