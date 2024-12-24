import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ArtworkFormData {
  title: string;
  artist: string;
  description: string;
  created_year: string;
  dimensions: string;
  format: string;
  starting_price: number;
  image_url: string;
  status: "draft" | "published" | "sold" | "archived";
}

const AdminArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ArtworkFormData>({
    defaultValues: {
      title: "",
      artist: "",
      description: "",
      created_year: "",
      dimensions: "",
      format: "",
      starting_price: 0,
      image_url: "",
      status: "draft",
    },
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error("You don't have access to this page");
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  // Fetch artwork data if editing
  useEffect(() => {
    if (id === "new") return;

    const fetchArtwork = async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Error fetching artwork");
        return;
      }

      if (data) {
        form.reset(data);
      }
    };

    fetchArtwork();
  }, [id, form]);

  const onSubmit = async (data: ArtworkFormData) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      if (id === "new") {
        const { error } = await supabase.from("artworks").insert({
          ...data,
          created_by: session.user.id,
        });
        if (error) throw error;
        toast.success("Artwork created successfully");
      } else {
        const { error } = await supabase
          .from("artworks")
          .update(data)
          .eq("id", id);
        if (error) throw error;
        toast.success("Artwork updated successfully");
      }

      navigate("/admin");
    } catch (error) {
      toast.error("Error saving artwork");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-serif mb-8">
        {id === "new" ? "New Artwork" : "Edit Artwork"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="created_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="starting_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="sold">Sold</option>
                    <option value="archived">Archived</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminArtwork;