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

  const fetchBids = async () => {
    try {
      console.log("Fetching bids for auction:", auctionId);
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });

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
    fetchBids();

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
        (payload) => {
          console.log('New bid received:', payload);
          const newBid = payload.new as Bid;
          setBids(currentBids => {
            // Check if the bid already exists to prevent duplicates
            const exists = currentBids.some(bid => bid.id === newBid.id);
            if (exists) {
              return currentBids;
            }
            // Add new bid at the beginning of the array
            return [newBid, ...currentBids];
          });
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedBids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>€{bid.amount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString()}
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