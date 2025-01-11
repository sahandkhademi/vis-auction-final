import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ArtworkFormData } from "@/types/artwork";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { convertToWebP } from "@/utils/imageUtils";

interface ImageUploadProps {
  form: UseFormReturn<ArtworkFormData>;
}

export const ImageUpload = ({ form }: ImageUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Convert to WebP
      const webpFile = await convertToWebP(file);
      
      // Upload file to Supabase storage
      const fileName = `${crypto.randomUUID()}.webp`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('artwork-images')
        .upload(fileName, webpFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artwork-images')
        .getPublicUrl(fileName);

      // Update form with the public URL
      form.setValue('image_url', publicUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Artwork Image</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {field.value && (
                <div className="mt-4">
                  <img
                    src={field.value}
                    alt="Artwork preview"
                    className="max-w-xs rounded-lg shadow-sm"
                  />
                </div>
              )}
              <Input
                type="text"
                {...field}
                placeholder="Image URL will appear here"
                className="mt-2"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};