import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ArtworkFormData } from "@/types/artwork";

interface ArtistSelectProps {
  form: UseFormReturn<ArtworkFormData>;
  isLoading: boolean;
}

export const ArtistSelect = ({ form, isLoading }: ArtistSelectProps) => {
  const { data: artists } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleArtistChange = (artistId: string) => {
    const selectedArtist = artists?.find(artist => artist.id === artistId);
    if (selectedArtist) {
      form.setValue("artist", selectedArtist.name);
      form.setValue("artist_id", selectedArtist.id);
    }
  };

  return (
    <FormField
      control={form.control}
      name="artist_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Artist</FormLabel>
          <Select
            onValueChange={handleArtistChange}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an artist" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {artists?.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};