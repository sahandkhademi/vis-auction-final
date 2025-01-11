import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Gavel, TrendingUp, Trophy, Timer, Percent } from "lucide-react";

interface UserStatsProps {
  userId?: string;
}

export const UserStats = ({ userId }: UserStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get all bids for the user
      const { data: bids, error } = await supabase
        .from("bids")
        .select(`
          amount,
          auction_id,
          artworks!auction_id (
            winner_id,
            current_price
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

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
      const wonAuctionsCount = wonAuctions?.length || 0;
      const totalWonAmount = wonAuctions?.reduce((sum, auction) => sum + Number(auction.current_price), 0) || 0;
      
      // Calculate success rate (won auctions / participated auctions)
      const uniqueAuctions = new Set(bids.map(bid => bid.auction_id));
      const successRate = uniqueAuctions.size > 0 
        ? ((wonAuctionsCount / uniqueAuctions.size) * 100).toFixed(1)
        : 0;

      // Calculate average bid amount
      const avgBidAmount = totalBids > 0 ? (totalAmount / totalBids) : 0;

      return {
        totalBids,
        totalAmount,
        highestBid,
        wonAuctionsCount,
        totalWonAmount,
        successRate,
        avgBidAmount,
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
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            €{stats.totalAmount.toLocaleString()}
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
            €{stats.highestBid.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Your highest single bid
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Won Auctions</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.wonAuctionsCount}</div>
          <p className="text-xs text-muted-foreground">
            Total auctions won
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Won Value</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            €{stats.totalWonAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total value of won auctions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Win rate for participated auctions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};