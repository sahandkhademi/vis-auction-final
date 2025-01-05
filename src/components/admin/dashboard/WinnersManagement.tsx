import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Winner = {
  id: string;
  title: string;
  current_price: number;
  payment_status: string;
  delivery_status: string;
  winner_id: string;
  profiles: {
    username: string | null;
    id: string;
    email: string | null;
  } | null;
};

export const WinnersManagement = () => {
  const { data: winners, refetch } = useQuery<Winner[]>({
    queryKey: ['winners'],
    queryFn: async () => {
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          current_price,
          payment_status,
          delivery_status,
          winner_id,
          profiles:winner_id (
            username,
            id,
            email
          )
        `)
        .not('winner_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return artworks;
    }
  });

  const handleMarkDelivered = async (artworkId: string) => {
    const { error } = await supabase
      .from('artworks')
      .update({ delivery_status: 'delivered' })
      .eq('id', artworkId);

    if (error) {
      toast.error("Failed to update delivery status");
      return;
    }

    toast.success("Artwork marked as delivered");
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Winners Management</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artwork</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners?.map((winner) => (
              <TableRow key={winner.id}>
                <TableCell>{winner.title}</TableCell>
                <TableCell>
                  {winner.profiles?.username || 'Unknown'}
                </TableCell>
                <TableCell>
                  {winner.profiles?.email || 'No email'}
                </TableCell>
                <TableCell>€{winner.current_price?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={winner.payment_status === 'completed' ? 'default' : 'secondary'}
                  >
                    {winner.payment_status === 'completed' ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={winner.delivery_status === 'delivered' ? 'default' : 'secondary'}
                  >
                    {winner.delivery_status === 'delivered' ? 'Delivered' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {winner.delivery_status !== 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkDelivered(winner.id)}
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
    </div>
  );
};