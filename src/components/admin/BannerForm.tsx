import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Upload } from "lucide-react";

interface BannerFormData {
  id?: string;
  title: string;
  description?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  active: boolean;
  display_order?: number;
  autoplay: boolean;
  autoplay_interval?: number;
}

interface BannerFormProps {
  defaultValues?: Partial<BannerFormData>;
  onSuccess: () => void;
}

export const BannerForm = ({ defaultValues, onSuccess }: BannerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const form = useForm<BannerFormData>({
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      button_text: "",
      button_link: "",
      active: true,
      display_order: 0,
      autoplay: false,
      autoplay_interval: 5000,
      ...defaultValues,
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banner-images')
        .getPublicUrl(fileName);

      form.setValue('image_url', publicUrl);
      toast.success('Image uploaded successfully');
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after a delay
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    try {
      setIsLoading(true);

      if (defaultValues?.id) {
        const { error } = await supabase
          .from("homepage_banners")
          .update(data)
          .eq("id", defaultValues.id);

        if (error) throw error;
        toast.success("Banner updated successfully");
      } else {
        const { error } = await supabase
          .from("homepage_banners")
          .insert([data]);

        if (error) throw error;
        toast.success("Banner created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-6">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              {...form.register("title")}
              placeholder="Enter banner title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              {...form.register("description")}
              placeholder="Enter banner description"
            />
          </div>

          <div>
            <Label>Banner Image</Label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="text-sm text-muted-foreground">
                    {Math.round(uploadProgress)}%
                  </div>
                )}
              </div>
              
              {form.watch('image_url') && (
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={form.watch('image_url')}
                    alt="Banner preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <Input
                type="text"
                {...form.register("image_url")}
                placeholder="Image URL will appear here"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Button Text</Label>
            <Input
              {...form.register("button_text")}
              placeholder="Enter button text"
            />
          </div>

          <div>
            <Label>Button Link</Label>
            <Input
              {...form.register("button_link")}
              placeholder="Enter button link"
            />
          </div>

          <div>
            <Label>Display Order</Label>
            <Input
              type="number"
              {...form.register("display_order")}
              placeholder="Enter display order"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label>Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch("autoplay")}
              onCheckedChange={(checked) => form.setValue("autoplay", checked)}
            />
            <Label>Enable Autoplay</Label>
          </div>

          {form.watch("autoplay") && (
            <div>
              <Label>Autoplay Interval (ms)</Label>
              <Input
                type="number"
                {...form.register("autoplay_interval")}
                placeholder="Enter autoplay interval in milliseconds"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {defaultValues?.id ? "Update" : "Create"} Banner
          </Button>
        </div>
      </form>
    </Form>
  );
};