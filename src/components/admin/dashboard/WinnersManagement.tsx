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
  email?: string;
}

interface ArtworkWithWinner {
  id: string;
  title: string;
  current_price: number | null;
  payment_status: string | null;
  delivery_status: string | null;
  winner: Winner | null;
}

interface AdminUser {
  id: string;
  email?: string;
}

export const WinnersManagement = () => {
  const { data: winners, refetch } = useQuery({
    queryKey: ["admin-winners"],
    queryFn: async () => {
      // First, get artworks with winners
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

      // For artworks with winners, get their emails using Edge Function
      if (artworks && artworks.length > 0) {
        const response = await fetch(
          `${process.env.SUPABASE_URL}/functions/v1/get-admin-user-data`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Error fetching user emails");
          return artworks as ArtworkWithWinner[];
        }

        const { users } = await response.json();
        const adminUsers = users as AdminUser[];

        // Map emails to winners
        return artworks.map(artwork => ({
          ...artwork,
          winner: artwork.winner ? {
            ...artwork.winner,
            email: adminUsers.find(u => u.id === artwork.winner?.id)?.email
          } : null
        })) as ArtworkWithWinner[];
      }

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
            <TableHead>Email</TableHead>
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
              <TableCell>{artwork.winner?.email}</TableCell>
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