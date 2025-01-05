import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Winner {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface ArtworkWithWinner {
  id: string;
  title: string;
  current_price: number | null;
  payment_status: string | null;
  delivery_status: string | null;
  winner: Winner | null;
}

export const WinnersManagement = () => {
  const { data: winners, refetch } = useQuery({
    queryKey: ["admin-winners"],
    queryFn: async () => {
      const { data: artworks, error } = await supabase
        .from("artworks")
        .select(`
          *,
          winner:profiles!artworks_winner_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .not("winner_id", "is", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return artworks as ArtworkWithWinner[];
    },
  });

  const handleDeliveryStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from("artworks")
        .update({ delivery_status: "delivered" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Artwork marked as delivered");
      refetch();
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Auction Winners</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artwork</TableHead>
            <TableHead>Winner</TableHead>
            <TableHead>Final Price</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Delivery Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {winners?.map((artwork) => (
            <TableRow key={artwork.id}>
              <TableCell className="font-medium">{artwork.title}</TableCell>
              <TableCell>{artwork.winner?.username || "No username"}</TableCell>
              <TableCell>
                ${artwork.current_price?.toLocaleString()}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(artwork.payment_status || "pending")}
              </TableCell>
              <TableCell>
                {getDeliveryStatusBadge(artwork.delivery_status || "pending")}
              </TableCell>
              <TableCell className="text-right">
                {artwork.delivery_status !== "delivered" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeliveryStatus(artwork.id)}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};