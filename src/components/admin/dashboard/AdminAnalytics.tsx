import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export const AdminAnalytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [artworksResponse, bidsResponse, artistsResponse] = await Promise.all([
        supabase.from("artworks").select("status,payment_status"),
        supabase.from("bids").select("amount"),
        supabase.from("artists").select("id"),
      ]);

      if (artworksResponse.error) throw artworksResponse.error;
      if (bidsResponse.error) throw bidsResponse.error;
      if (artistsResponse.error) throw artistsResponse.error;

      const artworks = artworksResponse.data;
      const bids = bidsResponse.data;
      const artists = artistsResponse.data;

      return {
        totalArtworks: artworks.length,
        publishedArtworks: artworks.filter(a => a.status === "published").length,
        soldArtworks: artworks.filter(a => a.payment_status === "completed").length,
        totalBids: bids.length,
        totalArtists: artists.length,
        totalValue: bids.reduce((sum, bid) => sum + Number(bid.amount), 0),
      };
    },
  });

  const { data: monthlyData, isLoading: isChartLoading } = useQuery({
    queryKey: ["monthly-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("created_at,starting_price")
        .order("created_at");

      if (error) throw error;

      const monthlyStats = data.reduce((acc: any[], artwork) => {
        const month = new Date(artwork.created_at).toLocaleString("default", {
          month: "short",
        });
        const existingMonth = acc.find((item) => item.month === month);
        
        if (existingMonth) {
          existingMonth.value += Number(artwork.starting_price);
          existingMonth.count += 1;
        } else {
          acc.push({ month, value: Number(artwork.starting_price), count: 1 });
        }
        
        return acc;
      }, []);

      return monthlyStats;
    },
  });

  if (isLoading || isChartLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtworks}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedArtworks} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.soldArtworks} artworks sold
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Artwork Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};