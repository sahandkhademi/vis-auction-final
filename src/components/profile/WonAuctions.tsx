import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface WonAuction {
  id: string;
  title: string;
  current_price: number;
  payment_status: string;
  image_url: string | null;
}

export const WonAuctions = ({ userId }: { userId: string }) => {
  const { data: wonAuctions, isLoading } = useQuery({
    queryKey: ["wonAuctions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, current_price, payment_status, image_url")
        .eq("winner_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as WonAuction[];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading won auctions...</div>;
  }

  if (!wonAuctions?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You haven't won any auctions yet. Keep bidding!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {wonAuctions.map((auction) => (
        <Card key={auction.id} className="overflow-hidden">
          <Link to={`/auction/${auction.id}`}>
            <div className="flex items-center gap-4 p-4">
              {auction.image_url && (
                <img
                  src={auction.image_url}
                  alt={auction.title}
                  className="h-20 w-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">{auction.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Final Price: €{auction.current_price.toLocaleString()}
                </p>
                <Badge
                  variant={auction.payment_status === "completed" ? "default" : "destructive"}
                  className={`mt-2 ${auction.payment_status === "completed" ? "bg-green-500 hover:bg-green-600" : ""}`}
                >
                  {auction.payment_status === "completed" ? "Paid" : "Payment Required"}
                </Badge>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};