import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  active: boolean;
  display_order: number | null;
}

interface BannerFormData {
  title: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  active: boolean;
  display_order: number;
}

export const BannerManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (formData: BannerFormData) => {
      const { error } = await supabase.from("homepage_banners").insert([formData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create banner: " + error.message);
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...formData }: BannerFormData & { id: string }) => {
      const { error } = await supabase
        .from("homepage_banners")
        .update(formData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update banner: " + error.message);
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_banners")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete banner: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      button_text: formData.get("button_text") as string,
      button_link: formData.get("button_link") as string,
      active: formData.get("active") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0,
    };

    if (selectedBanner) {
      updateBanner.mutate({ ...data, id: selectedBanner.id });
    } else {
      createBanner.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Banner Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setSelectedBanner(null)}
              className="ml-auto"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBanner ? "Edit Banner" : "Create Banner"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="title"
                  placeholder="Banner Title"
                  defaultValue={selectedBanner?.title || ""}
                  required
                />
              </div>
              <div>
                <Textarea
                  name="description"
                  placeholder="Description"
                  defaultValue={selectedBanner?.description || ""}
                />
              </div>
              <div>
                <Input
                  name="image_url"
                  placeholder="Image URL"
                  defaultValue={selectedBanner?.image_url || ""}
                  required
                />
              </div>
              <div>
                <Input
                  name="button_text"
                  placeholder="Button Text"
                  defaultValue={selectedBanner?.button_text || ""}
                />
              </div>
              <div>
                <Input
                  name="button_link"
                  placeholder="Button Link"
                  defaultValue={selectedBanner?.button_link || ""}
                />
              </div>
              <div>
                <Input
                  name="display_order"
                  type="number"
                  placeholder="Display Order"
                  defaultValue={selectedBanner?.display_order || 0}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  name="active"
                  defaultChecked={selectedBanner?.active ?? true}
                />
                <label>Active</label>
              </div>
              <Button type="submit" className="w-full">
                {selectedBanner ? "Update" : "Create"} Banner
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading banners...</div>
          ) : (
            banners?.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{banner.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {banner.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBanner(banner);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this banner?"
                        )
                      ) {
                        deleteBanner.mutate(banner.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};