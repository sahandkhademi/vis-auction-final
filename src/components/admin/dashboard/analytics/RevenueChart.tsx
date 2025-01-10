import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, subWeeks, subYears, format } from "date-fns";
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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type TimeWindow = "1w" | "1m" | "3m" | "6m" | "1y";

export const RevenueChart = () => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("6m");

  const getStartDate = (window: TimeWindow) => {
    const now = new Date();
    switch (window) {
      case "1w":
        return subWeeks(now, 1);
      case "1m":
        return subMonths(now, 1);
      case "3m":
        return subMonths(now, 3);
      case "6m":
        return subMonths(now, 6);
      case "1y":
        return subYears(now, 1);
    }
  };

  const { data: revenueData, isLoading, error } = useQuery({
    queryKey: ["revenueData", timeWindow],
    queryFn: async () => {
      console.log("Fetching revenue data for window:", timeWindow);
      const startDate = getStartDate(timeWindow);
      console.log("Start date:", startDate.toISOString());

      const { data, error: queryError } = await supabase
        .from("artworks")
        .select("current_price, updated_at")
        .eq("completion_status", "completed")
        .eq("payment_status", "paid")
        .gte("updated_at", startDate.toISOString());

      if (queryError) {
        console.error("Error fetching revenue data:", queryError);
        throw queryError;
      }

      console.log("Raw revenue data:", data);

      if (!data || data.length === 0) {
        console.log("No revenue data found");
        return [];
      }

      const monthlyRevenue = data.reduce((acc: any, artwork) => {
        const dateFormat = timeWindow === "1w" ? "EEE" : "MMM yyyy";
        const date = format(new Date(artwork.updated_at), dateFormat);
        acc[date] = (acc[date] || 0) + Number(artwork.current_price || 0);
        return acc;
      }, {});

      console.log("Processed revenue data:", monthlyRevenue);

      return Object.entries(monthlyRevenue).map(([month, amount]) => ({
        month,
        amount,
      }));
    },
  });

  if (error) {
    console.error("Error in revenue chart:", error);
    return (
      <Card>
        <CardContent className="pt-6 text-center text-red-500">
          Failed to load revenue data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Revenue from completed auctions</CardDescription>
        </div>
        <Select
          value={timeWindow}
          onValueChange={(value) => setTimeWindow(value as TimeWindow)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time window" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1w">Last Week</SelectItem>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Loading revenue data...
          </div>
        ) : revenueData && revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
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
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No revenue data available for this time period
          </div>
        )}
      </CardContent>
    </Card>
  );
};