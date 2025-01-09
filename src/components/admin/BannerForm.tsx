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

interface BannerFormData {
  id?: string;
  title: string;
  description?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  active: boolean;
  autoplay: boolean;
  autoplay_interval?: number;
}

interface BannerFormProps {
  defaultValues?: Partial<BannerFormData>;
  onSuccess: () => void;
}

export const BannerForm = ({ defaultValues, onSuccess }: BannerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BannerFormData>({
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      button_text: "",
      button_link: "",
      active: true,
      autoplay: false,
      autoplay_interval: 5000,
      ...defaultValues,
    },
  });

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
        // For new banners, set the display_order to the highest current order + 1
        const { data: existingBanners, error: fetchError } = await supabase
          .from("homepage_banners")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        const nextOrder = existingBanners?.[0]?.display_order ?? 0;
        
        const { error } = await supabase
          .from("homepage_banners")
          .insert([{ ...data, display_order: nextOrder + 1 }]);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Label>Image URL</Label>
            <Input
              {...form.register("image_url")}
              placeholder="Enter image URL"
            />
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