import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PopularArtwork = {
  title: string;
  count: number;
};

export const PopularArtworks = () => {
  const { data: popularArtworks } = useQuery<PopularArtwork[]>({
    queryKey: ["popularArtworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artwork_views')
        .select(`
          artwork_id,
          artworks (
            title
          ),
          count
        `)
        .select('*, count(*)', { count: 'exact' })
        .order('count', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching popular artworks:', error);
        return [];
      }

      return data.map(item => ({
        title: item.artworks?.title || 'Unknown',
        count: Number(item.count) || 0
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Viewed Artworks</CardTitle>
        <CardDescription>Top 5 artworks by view count</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={popularArtworks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};