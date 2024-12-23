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

interface Profile {
  username: string | null;
}

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  profile?: Profile | null;
}

interface BidHistoryProps {
  auctionId: string;
}

export const BidHistory = ({ auctionId }: BidHistoryProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBids = async () => {
    // First, fetch bids
    const { data: bidsData, error: bidsError } = await supabase
      .from('bids')
      .select(`
        id,
        amount,
        created_at,
        user_id
      `)
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });

    if (bidsError) {
      console.error('Error fetching bids:', bidsError);
      return;
    }

    // Then fetch profiles for each bid's user_id
    const bidsWithProfiles = await Promise.all(
      (bidsData || []).map(async (bid) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', bid.user_id)
          .single();

        return {
          ...bid,
          profile: profileData
        };
      })
    );

    setBids(bidsWithProfiles);
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
              <TableCell>{bid.profile?.username || 'Anonymous'}</TableCell>
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