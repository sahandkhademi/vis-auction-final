import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { subDays } from "date-fns";

export const BasicStats = () => {
  const { data: totalAuctions } = useQuery({
    queryKey: ["totalAuctions"],
    queryFn: async () => {
      const { count: currentCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });

      const previousDate = subDays(new Date(), 7).toISOString();
      const { count: previousCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .lt("created_at", previousDate);

      const percentageChange = previousCount 
        ? ((currentCount! - previousCount) / previousCount) * 100 
        : 0;

      return {
        current: currentCount || 0,
        change: percentageChange.toFixed(1),
      };
    },
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const { count: currentCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing");

      const previousDate = subDays(new Date(), 7).toISOString();
      const { count: previousCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing")
        .lt("created_at", previousDate);

      const percentageChange = previousCount 
        ? ((currentCount! - previousCount) / previousCount) * 100 
        : 0;

      return {
        current: currentCount || 0,
        change: percentageChange.toFixed(1),
      };
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count: currentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const previousDate = subDays(new Date(), 7).toISOString();
      const { count: previousCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", previousDate);

      const percentageChange = previousCount 
        ? ((currentCount! - previousCount) / previousCount) * 100 
        : 0;

      return {
        current: currentCount || 0,
        change: percentageChange.toFixed(1),
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
    return <span className="text-sm text-gray-500">0%</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalAuctions?.current}</p>
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
          <p className="text-3xl font-bold">{activeAuctions?.current}</p>
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
          <p className="text-3xl font-bold">{totalUsers?.current}</p>
          <div className="mt-2">
            {renderChange(totalUsers?.change || "0")}
            <p className="text-sm text-gray-500">vs last week</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};