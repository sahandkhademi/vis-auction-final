import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface WonAuction {
  id: string;
  title: string;
  current_price: number;
  payment_status: string;
  image_url: string | null;
  winner_id: string | null;
  completion_status: string;
}

export const WonAuctions = ({ userId }: { userId: string }) => {
  const { data: wonAuctions, isLoading } = useQuery({
    queryKey: ["wonAuctions", userId],
    queryFn: async () => {
      console.log("Fetching won auctions for user:", userId);
      
      // Get all completed auctions where user is explicitly set as winner
      const { data: winnerAuctions, error: winnerError } = await supabase
        .from("artworks")
        .select("id, title, current_price, payment_status, image_url, winner_id, completion_status")
        .eq("winner_id", userId)
        .eq("completion_status", "completed")
        .order("updated_at", { ascending: false });

      if (winnerError) {
        console.error("Error fetching winner auctions:", winnerError);
        throw winnerError;
      }

      console.log("Explicit winner auctions:", winnerAuctions);

      // Get all completed auctions where the user has placed bids
      const { data: userBids, error: bidsError } = await supabase
        .from("bids")
        .select(`
          auction_id,
          amount,
          artworks!inner (
            id,
            title,
            current_price,
            payment_status,
            image_url,
            winner_id,
            completion_status
          )
        `)
        .eq("user_id", userId)
        .eq("artworks.completion_status", "completed")
        .is("artworks.winner_id", null)
        .order("amount", { ascending: false });

      if (bidsError) {
        console.error("Error fetching user bids:", bidsError);
        throw bidsError;
      }

      console.log("User bids with auction data:", userBids);

      // For each auction where user has bid, verify if they have the highest bid
      const verifiedWins = await Promise.all(
        (userBids || []).map(async (bid) => {
          const { data: highestBid } = await supabase
            .from("bids")
            .select("user_id, amount")
            .eq("auction_id", bid.auction_id)
            .order("amount", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (highestBid?.user_id === userId) {
            return bid.artworks;
          }
          return null;
        })
      );

      console.log("Verified wins:", verifiedWins);

      // Combine explicit wins and highest bid wins, removing duplicates
      const allWonAuctions = [
        ...(winnerAuctions || []),
        ...verifiedWins.filter(Boolean)
      ];

      const uniqueAuctions = Array.from(
        new Map(allWonAuctions.map(auction => [auction.id, auction])).values()
      );

      console.log("Final unique won auctions:", uniqueAuctions);
      
      return uniqueAuctions as WonAuction[];
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