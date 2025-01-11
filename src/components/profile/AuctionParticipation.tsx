import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

interface Participation {
  auction_id: string;
  amount: number;
  created_at: string;
  artwork: {
    title: string;
    current_price: number;
    winner_id: string | null;
  } | null;
}

export const AuctionParticipation = ({ userId }: { userId: string }) => {
  const { data: participations, isLoading } = useQuery({
    queryKey: ["participations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          auction_id,
          amount,
          created_at,
          artwork:artworks!auction_id (
            title,
            current_price,
            winner_id
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Participation[];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading participation history...</div>;
  }

  if (!participations?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You haven't participated in any lots yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {participations.map((participation) => (
        <Card key={`${participation.auction_id}-${participation.created_at}`}>
          <Link to={`/auction/${participation.auction_id}`}>
            <div className="p-4">
              <h3 className="font-medium">
                {participation.artwork?.title || "Unknown Artwork"}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Your Bid: €{participation.amount.toLocaleString()}</p>
                <p>
                  Status:{" "}
                  {participation.artwork?.winner_id === userId
                    ? "Won"
                    : participation.artwork?.current_price &&
                      participation.amount >= participation.artwork.current_price
                    ? "Leading"
                    : "Outbid"}
                </p>
                <p>
                  Bid placed on:{" "}
                  {new Date(participation.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};