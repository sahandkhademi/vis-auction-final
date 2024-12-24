import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { ArtworkFormData, ArtworkData } from "@/types/artwork";

const AdminArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [artwork, setArtwork] = useState<Partial<ArtworkFormData>>({});

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
        // Convert the artwork data to match ArtworkFormData type
        const formData: ArtworkFormData = {
          title: data.title,
          artist: data.artist,
          description: data.description || "",
          created_year: data.created_year || "",
          dimensions: data.dimensions || "",
          format: data.format || "",
          starting_price: data.starting_price,
          image_url: data.image_url || "",
          status: data.status as ArtworkFormData["status"] || "draft"
        };
        setArtwork(formData);
      }
    };

    fetchArtwork();
  }, [id]);

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

      <ArtworkForm
        defaultValues={artwork}
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={() => navigate("/admin")}
      />
    </div>
  );
};

export default AdminArtwork;