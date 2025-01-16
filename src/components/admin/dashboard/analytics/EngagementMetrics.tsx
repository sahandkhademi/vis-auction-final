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

      // Initialize the last 7 days
      const dailyData = new Map();
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

      // Process unique visitors day by day
      const processedDays = new Set<string>();
      const dailyUniqueSessions = new Map<string, Set<string>>();

      uniqueVisitors?.forEach(visit => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        if (!dailyUniqueSessions.has(date)) {
          dailyUniqueSessions.set(date, new Set<string>());
        }
        if (visit.session_id) {
          dailyUniqueSessions.get(date)?.add(visit.session_id);
        }
      });

      // Process registered users day by day
      const dailyRegisteredUsers = new Map<string, Set<string>>();

      registeredVisitors?.forEach(visit => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        if (!dailyRegisteredUsers.has(date)) {
          dailyRegisteredUsers.set(date, new Set<string>());
        }
        if (visit.visitor_id) {
          dailyRegisteredUsers.get(date)?.add(visit.visitor_id);
        }
      });

      // Update daily counts
      for (const [date, data] of dailyData.entries()) {
        const uniqueSessionsForDay = dailyUniqueSessions.get(date)?.size || 0;
        const registeredUsersForDay = dailyRegisteredUsers.get(date)?.size || 0;
        
        dailyData.set(date, {
          ...data,
          unique: uniqueSessionsForDay,
          registered: registeredUsersForDay
        });
      }

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