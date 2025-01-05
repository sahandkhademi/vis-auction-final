import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";
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

export const RevenueChart = () => {
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

  return (
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
  );
};