import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementMetrics = () => {
  const { data: retentionData } = useQuery({
    queryKey: ["user-retention-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_retention")
        .select("*")
        .order('visit_date', { ascending: true })
        .limit(7);

      if (error) throw error;
      
      return data.map(day => ({
        date: new Date(day.visit_date).toLocaleDateString('en-US', { weekday: 'short' }),
        total: day.total_visitors,
        registered: day.registered_visitors
      }));
    },
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>User Engagement</CardTitle>
        <CardDescription>Daily visitor breakdown over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total Visitors" fill="#C6A07C" />
              <Bar dataKey="registered" name="Registered Users" fill="#B89068" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};