import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementMetrics = () => {
  const { data: retentionData } = useQuery({
    queryKey: ["user-retention-trend"],
    queryFn: async () => {
      // Get unique visitors per day
      const { data: uniqueVisitors, error: uniqueError } = await supabase
        .from('website_visits')
        .select('visited_at, session_id')
        .gte('visited_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (uniqueError) {
        console.error("Error fetching unique visitors:", uniqueError);
        throw uniqueError;
      }

      // Get registered users per day
      const { data: registeredVisitors, error: registeredError } = await supabase
        .from('website_visits')
        .select('visited_at, visitor_id')
        .not('visitor_id', 'is', null)
        .gte('visited_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (registeredError) {
        console.error("Error fetching registered visitors:", registeredError);
        throw registeredError;
      }

      // Process data to get daily counts
      const dailyData = new Map();

      // Initialize the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dailyData.set(date.toISOString().split('T')[0], {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          unique: 0,
          registered: 0
        });
      }

      // Count unique visitors by session_id
      const uniqueSessions = new Set<string>();
      uniqueVisitors?.forEach(visit => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        if (dailyData.has(date)) {
          uniqueSessions.add(`${date}-${visit.session_id}`);
          const data = dailyData.get(date);
          data.unique = Array.from(uniqueSessions).filter(s => s.startsWith(date)).length;
          dailyData.set(date, data);
        }
      });

      // Count registered users by visitor_id
      const registeredUsers = new Set<string>();
      registeredVisitors?.forEach(visit => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        if (dailyData.has(date)) {
          registeredUsers.add(`${date}-${visit.visitor_id}`);
          const data = dailyData.get(date);
          data.registered = Array.from(registeredUsers).filter(s => s.startsWith(date)).length;
          dailyData.set(date, data);
        }
      });

      return Array.from(dailyData.values()).reverse();
    },
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>User Engagement</CardTitle>
        <CardDescription>Daily unique visitor breakdown over the last 7 days</CardDescription>
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