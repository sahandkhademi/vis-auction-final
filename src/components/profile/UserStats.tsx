import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Gavel, TrendingUp } from "lucide-react";

interface UserStatsProps {
  userId?: string;
}

export const UserStats = ({ userId }: UserStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: bids, error } = await supabase
        .from("bids")
        .select("amount")
        .eq("user_id", userId);

      if (error) throw error;

      const totalBids = bids.length;
      const totalAmount = bids.reduce((sum, bid) => sum + Number(bid.amount), 0);
      const highestBid = bids.reduce((max, bid) => Math.max(max, Number(bid.amount)), 0);

      return {
        totalBids,
        totalAmount,
        highestBid,
      };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  if (!stats) {
    return <div>No statistics available</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
          <Gavel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBids}</div>
          <p className="text-xs text-muted-foreground">
            Bids placed across all auctions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total value of all bids
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Bid</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.highestBid.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Your highest single bid
          </p>
        </CardContent>
      </Card>
    </div>
  );
};