import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Gavel, TrendingUp, Trophy, Percent, Timer, Target } from "lucide-react";

interface UserStatsProps {
  userId?: string;
}

export const UserStats = ({ userId }: UserStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get all bids by the user
      const { data: bids, error: bidsError } = await supabase
        .from("bids")
        .select(`
          amount,
          auction_id,
          artworks!auction_id (
            winner_id,
            current_price,
            completion_status
          )
        `)
        .eq("user_id", userId);

      if (bidsError) throw bidsError;

      // Get won auctions
      const { data: wonAuctions, error: wonError } = await supabase
        .from("artworks")
        .select("current_price")
        .eq("winner_id", userId)
        .eq("completion_status", "completed");

      if (wonError) throw wonError;

      const totalBids = bids.length;
      const totalAmount = bids.reduce((sum, bid) => sum + Number(bid.amount), 0);
      const highestBid = bids.reduce((max, bid) => Math.max(max, Number(bid.amount)), 0);
      
      // Calculate unique auctions participated in
      const uniqueAuctions = new Set(bids.map(bid => bid.auction_id)).size;
      
      // Calculate win rate
      const wonAuctionsCount = wonAuctions?.length || 0;
      const winRate = uniqueAuctions > 0 
        ? ((wonAuctionsCount / uniqueAuctions) * 100).toFixed(1) 
        : 0;

      // Calculate total value of won auctions
      const totalWonValue = wonAuctions?.reduce((sum, auction) => 
        sum + Number(auction.current_price), 0) || 0;

      // Calculate average bid amount
      const averageBid = totalBids > 0 
        ? totalAmount / totalBids 
        : 0;

      return {
        totalBids,
        totalAmount,
        highestBid,
        uniqueAuctions,
        wonAuctionsCount,
        winRate,
        totalWonValue,
        averageBid,
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
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 px-1">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Bids</CardTitle>
          <Gavel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.totalBids}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Across {stats.uniqueAuctions} auctions
          </p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Amount</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            €{stats.totalAmount.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Average: €{Math.round(stats.averageBid).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Won Auctions</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.wonAuctionsCount}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Value: €{stats.totalWonValue.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Win Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.winRate}%</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Success rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};