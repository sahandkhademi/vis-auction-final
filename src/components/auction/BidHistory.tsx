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
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  auction_id: string;
}

interface BidHistoryProps {
  auctionId: string;
}

export const BidHistory = ({ auctionId }: BidHistoryProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllBids, setShowAllBids] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      console.log("Fetching bids for auction:", auctionId);
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false });

      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        return;
      }

      console.log('Fetched bids:', bidsData);
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error in fetchBids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    getCurrentUser();
    fetchBids();

    // Set up real-time subscription
    const channel = supabase
      .channel('bid-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`
        },
        async (payload) => {
          console.log('Bid change received:', payload);
          // Refetch all bids to ensure consistent state
          await fetchBids();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading bid history...</div>;
  }

  if (bids.length === 0) {
    return <div className="text-center py-4 text-gray-500">No bids yet</div>;
  }

  const displayedBids = showAllBids ? bids : bids.slice(0, 4);
  const hasMoreBids = bids.length > 4;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Bid History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedBids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>€{bid.amount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString()}
              </TableCell>
              <TableCell className="text-right">
                {bid.user_id === currentUserId && (
                  <span className="text-sm" style={{ color: "#00337F" }}>(You)</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {hasMoreBids && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-gray-600 hover:text-gray-900"
          onClick={() => setShowAllBids(!showAllBids)}
        >
          {showAllBids ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show All Bids <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};