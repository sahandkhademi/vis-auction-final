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
  auction_id: string;
  artwork: {
    title: string;
  } | null;
}

interface BidHistoryProps {
  userId: string;
}

export const BidHistory = ({ userId }: BidHistoryProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBids = async () => {
    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          user_id,
          auction_id,
          artwork:artworks!auction_id(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        return;
      }

      setBids(bidsData || []);
    } catch (error) {
      console.error('Error in fetchBids:', error);
    } finally {
      setIsLoading(false);
    }
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
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
            <TableHead>Artwork</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>{bid.artwork?.title || 'Unknown Artwork'}</TableCell>
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