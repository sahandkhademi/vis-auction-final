import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const BasicStats = () => {
  const { data: totalAuctions } = useQuery({
    queryKey: ["totalAuctions"],
    queryFn: async () => {
      const currentDate = new Date();
      const previousDate = subDays(currentDate, 7);

      const { count: currentCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });

      const { count: previousCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .lt("created_at", startOfDay(previousDate).toISOString());

      const { count: weeklyCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay(previousDate).toISOString())
        .lte("created_at", endOfDay(currentDate).toISOString());

      const percentageChange = previousCount && previousCount > 0
        ? (((weeklyCount || 0) / previousCount) * 100 - 100).toFixed(1)
        : "0";

      return {
        current: currentCount || 0,
        change: percentageChange,
      };
    },
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const currentDate = new Date();
      const previousDate = subDays(currentDate, 7);

      const { count: currentCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing");

      const { count: previousCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing")
        .lt("created_at", startOfDay(previousDate).toISOString());

      const { count: weeklyCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing")
        .gte("created_at", startOfDay(previousDate).toISOString())
        .lte("created_at", endOfDay(currentDate).toISOString());

      const percentageChange = previousCount && previousCount > 0
        ? (((weeklyCount || 0) / previousCount) * 100 - 100).toFixed(1)
        : "0";

      return {
        current: currentCount || 0,
        change: percentageChange,
      };
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const currentDate = new Date();
      const previousDate = subDays(currentDate, 7);

      const { count: currentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: previousCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", startOfDay(previousDate).toISOString());

      const { count: weeklyCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay(previousDate).toISOString())
        .lte("created_at", endOfDay(currentDate).toISOString());

      const percentageChange = previousCount && previousCount > 0
        ? (((weeklyCount || 0) / previousCount) * 100 - 100).toFixed(1)
        : "0";

      return {
        current: currentCount || 0,
        change: percentageChange,
      };
    },
  });

  const renderChange = (change: string) => {
    const numChange = parseFloat(change);
    if (numChange > 0) {
      return (
        <div className="flex items-center text-sm text-green-600">
          <ArrowUpIcon className="w-4 h-4 mr-1" />
          <span>+{change}%</span>
        </div>
      );
    } else if (numChange < 0) {
      return (
        <div className="flex items-center text-sm text-red-600">
          <ArrowDownIcon className="w-4 h-4 mr-1" />
          <span>{change}%</span>
        </div>
      );
    }
    return <span className="text-sm text-gray-500">No change</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalAuctions?.current || 0}</p>
          <div className="mt-2">
            {renderChange(totalAuctions?.change || "0")}
            <p className="text-sm text-gray-500">vs last week</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{activeAuctions?.current || 0}</p>
          <div className="mt-2">
            {renderChange(activeAuctions?.change || "0")}
            <p className="text-sm text-gray-500">vs last week</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalUsers?.current || 0}</p>
          <div className="mt-2">
            {renderChange(totalUsers?.change || "0")}
            <p className="text-sm text-gray-500">vs last week</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};