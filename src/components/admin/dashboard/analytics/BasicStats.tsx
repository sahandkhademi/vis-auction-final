import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BasicStats = () => {
  const { data: totalAuctions } = useQuery({
    queryKey: ["totalAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing");
      return count || 0;
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalAuctions}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{activeAuctions}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </CardContent>
      </Card>
    </div>
  );
};