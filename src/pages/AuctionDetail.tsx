import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArtworkImage } from "@/components/auction/ArtworkImage";
import { AuctionDetails } from "@/components/auction/AuctionDetails";
import { ArtworkWithArtist } from "@/types/auction";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: artwork, error: artworkError, refetch } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      if (!id) throw new Error('No artwork ID provided');
      
      const { data: artworkWithLinkedArtist, error: linkedError } = await supabase
        .from('artworks')
        .select(`
          *,
          artist:artists!artworks_artist_id_fkey (
            id,
            name,
            bio,
            profile_image_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (linkedError) {
        console.error('Error fetching artwork:', linkedError);
        throw linkedError;
      }

      return artworkWithLinkedArtist as ArtworkWithArtist;
    },
    enabled: !!id,
  });

  // Subscribe to auction updates and bids
  useEffect(() => {
    if (!id) return;

    console.log('🔄 Setting up auction subscriptions');
    
    // Subscribe to auction status updates
    const auctionChannel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          console.log('🔄 Received auction update:', payload);
          const newData = payload.new as { completion_status: string };
          
          if (newData.completion_status === 'completed') {
            console.log('🏁 Auction completed, refreshing data');
            await refetch();
            toast.info("This auction has ended");
          }
        }
      )
      .subscribe();

    // Subscribe to new bids
    const bidsChannel = supabase
      .channel('new-bids')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${id}`
        },
        async (payload) => {
          const newBid = payload.new as { amount: number };
          console.log('📈 New bid received:', newBid);
          setCurrentHighestBid(newBid.amount);
          toast.info(`New bid: €${newBid.amount.toLocaleString()}`);
        }
      )
      .subscribe();

    // Fetch initial highest bid
    const fetchHighestBid = async () => {
      try {
        const { data, error } = await supabase
          .from('bids')
          .select('amount')
          .eq('auction_id', id)
          .order('amount', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching highest bid:', error);
          return;
        }

        if (data) {
          setCurrentHighestBid(data.amount);
        }
      } catch (error) {
        console.error('Failed to fetch highest bid:', error);
      }
    };

    fetchHighestBid();

    // Record page visit silently - don't block on errors
    const recordVisit = async () => {
      try {
        const sessionId = crypto.randomUUID();
        const { error } = await supabase.rpc('track_website_visit', {
          p_session_id: sessionId,
          p_path: window.location.pathname,
          p_user_agent: navigator.userAgent
        });
        
        if (error) {
          console.warn('Non-critical: Failed to record visit:', error);
        }
      } catch (error) {
        console.warn('Non-critical: Failed to record visit:', error);
      }
    };

    // Don't await this - let it run in background
    recordVisit();

    return () => {
      console.log('🔄 Cleaning up auction subscriptions');
      supabase.removeChannel(auctionChannel);
      supabase.removeChannel(bidsChannel);
    };
  }, [id, refetch]);

  if (artworkError) {
    toast.error("Error loading artwork details");
    return null;
  }

  if (!artwork) {
    return <div className="min-h-screen bg-white pt-20 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Button
          variant="ghost"
          className="mb-8 text-gray-600 hover:text-gray-900 -ml-4"
          onClick={() => navigate("/auctions")}
        >
          ← Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ArtworkImage 
            imageUrl={artwork.image_url} 
            title={artwork.title} 
          />

          <AuctionDetails
            artwork={artwork}
            currentHighestBid={currentHighestBid}
            isLoading={isLoading}
            onBidPlaced={() => refetch()}
          />
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;