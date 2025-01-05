import { EmailTester } from "../EmailTester";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { startOfMonth, subMonths, format } from "date-fns";

export const AdminAnalytics = () => {
  const { data: totalAuctions } = useQuery({
    queryKey: ["totalAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing");
      return count || 0;
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      const startDate = subMonths(startOfMonth(new Date()), 6);
      const { data } = await supabase
        .from("artworks")
        .select("current_price, updated_at")
        .eq("completion_status", "completed")
        .eq("payment_status", "paid")
        .gte("updated_at", startDate.toISOString());

      const monthlyRevenue = data?.reduce((acc: any, artwork) => {
        const month = format(new Date(artwork.updated_at), "MMM yyyy");
        acc[month] = (acc[month] || 0) + (artwork.current_price || 0);
        return acc;
      }, {});

      return Object.entries(monthlyRevenue || {}).map(([month, amount]) => ({
        month,
        amount,
      }));
    },
  });

  const { data: userEngagement } = useQuery({
    queryKey: ["userEngagement"],
    queryFn: async () => {
      const { data: viewsData } = await supabase
        .from("artwork_views")
        .select("viewed_at")
        .gte("viewed_at", subMonths(new Date(), 1).toISOString());

      const { data: bidsData } = await supabase
        .from("bids")
        .select("created_at")
        .gte("created_at", subMonths(new Date(), 1).toISOString());

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

  // Popular artworks - Fixed query
  const { data: popularArtworks } = useQuery({
    queryKey: ["popularArtworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artwork_views')
        .select('artwork_id, count')
        .select('artwork_id, artworks!inner(title), count', {
          count: 'exact',
          head: false
        })
        .returns<{ artwork_id: string; artworks: { title: string }; count: number }[]>()
        .limit(5);

      if (error) {
        console.error('Error fetching popular artworks:', error);
        return [];
      }

      return data.map(item => ({
        title: item.artworks?.title || 'Unknown',
        count: item.count || 0
      }));
    },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Admin Analytics</h2>
      <EmailTester />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalAuctions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeAuctions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Last 6 months of revenue from completed auctions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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

        {/* Popular Artworks */}
        <Card>
          <CardHeader>
            <CardTitle>Most Viewed Artworks</CardTitle>
            <CardDescription>Top 5 artworks by view count</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularArtworks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Database Connection</span>
                <span className="text-green-500">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Storage Service</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email Service</span>
                <span className="text-green-500">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
