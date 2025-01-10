import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

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

  const stats = [
    {
      title: "Total Visitors",
      value: retentionData?.total_visitors || 0,
      icon: Users,
      description: "Unique visitors today",
    },
    {
      title: "Registered Users",
      value: retentionData?.registered_visitors || 0,
      icon: Users,
      description: "Active registered users",
    },
    {
      title: "Monthly Sales",
      value: commissionData?.total_sales || 0,
      icon: DollarSign,
      description: "Total sales this month",
    },
    {
      title: "Commission Earned",
      value: `€${(commissionData?.commission_earned || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      description: "Commission this month",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};