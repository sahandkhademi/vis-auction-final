import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
  } | null;
}

interface BidHistoryProps {
  auctionId: string;
}

export const BidHistory = ({ auctionId }: BidHistoryProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBids = async () => {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        id,
        amount,
        created_at,
        user_id,
        profiles(username)
      `)
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bids:', error);
      return;
    }

    setBids(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBids();

    // Subscribe to new bids
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading bid history...</div>;
  }

  if (bids.length === 0) {
    return <div className="text-center py-4 text-gray-500">No bids yet</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Bid History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bidder</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>{bid.profiles?.username || 'Anonymous'}</TableCell>
              <TableCell>${bid.amount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};