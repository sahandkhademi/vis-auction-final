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
import { MoreVertical, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleRetryCharge = async (artworkId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('charge-winner', {
        body: { artworkId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Payment processed successfully");
      } else {
        toast.error(data?.message || "Failed to process payment");
      }

      refetch();
    } catch (error) {
      console.error('Error retrying charge:', error);
      toast.error("Failed to process payment");
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
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
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners?.map((winner) => (
              <TableRow key={winner.id}>
                <TableCell>{winner.title}</TableCell>
                <TableCell>
                  {winner.profiles?.username || 'NULL'}
                </TableCell>
                <TableCell>
                  {winner.profiles?.email || 'No email'}
                </TableCell>
                <TableCell>€{winner.current_price?.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPaymentStatusBadge(winner.payment_status)}
                    {winner.payment_status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRetryCharge(winner.id)}
                        title="Retry charge"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={winner.delivery_status === 'delivered' ? 'default' : 'secondary'}
                  >
                    {winner.delivery_status === 'delivered' ? 'Delivered' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {winner.delivery_status !== 'delivered' && (
                        <DropdownMenuItem onClick={() => handleMarkDelivered(winner.id)}>
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};