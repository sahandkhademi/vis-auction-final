import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3 mr-1 text-green-600"
  >
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3 mr-1 text-red-600"
  >
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const BasicStats = () => {
  const { data: commissionData } = useQuery({
    queryKey: ["commission-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_earnings")
        .select("*")
        .limit(1);

      if (error) throw error;
      return data[0];
    },
  });

  const { data: retentionData } = useQuery({
    queryKey: ["user-retention"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_retention")
        .select("*")
        .limit(1);

      if (error) throw error;
      return data[0];
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq('is_admin', false);

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("current_price")
        .eq("payment_status", "completed");

      if (error) throw error;
      return data.reduce((sum, artwork) => sum + (artwork.current_price || 0), 0);
    },
  });

  const { data: avgSessionTime } = useQuery({
    queryKey: ["avg-session-time", Date.now()], // Add timestamp to force refresh
    queryFn: async () => {
      console.log("Fetching average session time...");
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("website_visits")
        .select("session_duration")
        .gte('visited_at', thirtyDaysAgo.toISOString())
        .not('session_duration', 'is', null)
        .order('visited_at', { ascending: false });

      if (error) {
        console.error("Error fetching session duration:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No session data available");
        return 0;
      }

      const validDurations = data.filter(visit => 
        visit.session_duration && 
        visit.session_duration > 0 && 
        visit.session_duration < 14400 // 4 hours in seconds
      );

      if (validDurations.length === 0) {
        console.log("No valid session durations found");
        return 0;
      }

      const totalDuration = validDurations.reduce((sum, visit) => sum + visit.session_duration!, 0);
      const avgDuration = Math.round(totalDuration / validDurations.length);
      
      console.log("Raw session data:", data);
      console.log("Valid durations count:", validDurations.length);
      console.log("Total duration:", totalDuration);
      console.log("Calculated average duration:", avgDuration);
      
      return avgDuration;
    },
    refetchInterval: 5000, // Reduce interval to 5 seconds for testing
    staleTime: 3000, // Reduce stale time to 3 seconds
    gcTime: 0, // Using gcTime instead of cacheTime
    refetchOnWindowFocus: true,
  });

  const { data: previousPeriodData } = useQuery({
    queryKey: ["previous-period-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: users } = await supabase
        .from("profiles")
        .select("created_at")
        .eq('is_admin', false)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lte('created_at', thirtyDaysAgo.toISOString());

      const { data: revenue } = await supabase
        .from("artworks")
        .select("current_price, updated_at")
        .eq("payment_status", "completed")
        .gte('updated_at', sixtyDaysAgo.toISOString())
        .lte('updated_at', thirtyDaysAgo.toISOString());

      const { data: visits } = await supabase
        .from("website_visits")
        .select("session_duration")
        .gte('visited_at', sixtyDaysAgo.toISOString())
        .lte('visited_at', thirtyDaysAgo.toISOString());

      return {
        userCount: users?.length || 0,
        revenue: revenue?.reduce((sum, artwork) => sum + (artwork.current_price || 0), 0) || 0,
        avgSessionTime: visits?.length ? 
          Math.round(visits.reduce((sum, visit) => sum + (visit.session_duration || 0), 0) / visits.length) : 
          0
      };
    },
  });

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatSessionDuration = (seconds: number) => {
    if (!seconds) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = [
    {
      title: "Total Users",
      value: userCount || 0,
      icon: Users,
      description: "Non-admin users",
      change: calculateChange(userCount || 0, previousPeriodData?.userCount || 0),
      trend: "vs last 30 days",
    },
    {
      title: "Total Revenue",
      value: `€${(totalRevenue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      description: "Total completed sales",
      change: calculateChange(totalRevenue || 0, previousPeriodData?.revenue || 0),
      trend: "vs last 30 days",
    },
    {
      title: "Monthly Sales",
      value: commissionData?.total_sales || 0,
      icon: TrendingUp,
      description: "Sales this month",
      change: 0,
      trend: "vs last month",
    },
    {
      title: "Avg. Session Duration",
      value: formatSessionDuration(avgSessionTime || 0),
      icon: Clock,
      description: "Average time per visit",
      change: calculateChange(avgSessionTime || 0, previousPeriodData?.avgSessionTime || 0),
      trend: "vs last 30 days",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-[#00337F]" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.change !== 0 && (
                  <div className="flex items-center space-x-1">
                    <div
                      className={cn(
                        "flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
                        stat.change > 0 
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {stat.change > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                      <span>{Math.abs(stat.change).toFixed(1)}%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stat.trend}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
