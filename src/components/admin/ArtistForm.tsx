import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtistFormData {
  name: string;
  bio: string;
  profile_image_url?: string;
}

interface ArtistFormProps {
  defaultValues?: ArtistFormData;
  artistId?: string;
  onSuccess?: () => void;
}

export const ArtistForm = ({ defaultValues, artistId, onSuccess }: ArtistFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(defaultValues?.profile_image_url || "");
  
  const { register, handleSubmit, formState: { errors } } = useForm<ArtistFormData>({
    defaultValues: {
      name: defaultValues?.name || "",
      bio: defaultValues?.bio || "",
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${artistId || crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artist-avatars')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ArtistFormData) => {
    try {
      setIsLoading(true);
      const artistData = {
        ...data,
        profile_image_url: imageUrl || null,
      };

      if (artistId) {
        const { error } = await supabase
          .from("artists")
          .update(artistData)
          .eq("id", artistId);

        if (error) throw error;
        toast.success("Artist updated successfully");
      } else {
        const { error } = await supabase
          .from("artists")
          .insert([artistData]);

        if (error) throw error;
        toast.success("Artist created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving artist:", error);
      toast.error("Failed to save artist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User className="h-10 w-10 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="image" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Upload className="h-4 w-4" />
              Upload Avatar
            </div>
          </Label>
          <input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biography</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          disabled={isLoading}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {artistId ? "Update Artist" : "Create Artist"}
        </Button>
      </div>
    </form>
  );
};