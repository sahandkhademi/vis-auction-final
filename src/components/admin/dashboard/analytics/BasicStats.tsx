import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    queryKey: ["avg-session-time"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_visits")
        .select("session_duration")
        .not("session_duration", "is", null);

      if (error) throw error;
      const totalDuration = data.reduce((sum, visit) => sum + (visit.session_duration || 0), 0);
      return data.length ? Math.round(totalDuration / data.length) : 0;
    },
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

  const stats = [
    {
      title: "Total Users",
      value: userCount || 0,
      icon: Users,
      description: "Non-admin users",
      change: calculateChange(userCount || 0, previousPeriodData?.userCount || 0),
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
    },
    {
      title: "Monthly Sales",
      value: commissionData?.total_sales || 0,
      icon: TrendingUp,
      description: "Sales this month",
      change: 0, // We'll keep this at 0 since we don't have previous month's commission data
    },
    {
      title: "Avg. Session Duration",
      value: `${Math.floor((avgSessionTime || 0) / 60)}m ${(avgSessionTime || 0) % 60}s`,
      icon: Clock,
      description: "Average time per visit",
      change: calculateChange(avgSessionTime || 0, previousPeriodData?.avgSessionTime || 0),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-[#00337F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.change !== 0 && (
                <div className={cn(
                  "flex items-center text-xs",
                  stat.change > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {stat.change > 0 ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  <span>{Math.abs(stat.change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
