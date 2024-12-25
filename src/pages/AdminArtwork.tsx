import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkFormData } from "@/types/artwork";

const AdminArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<ArtworkFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArtwork();
    }
  }, [id]);

  const fetchArtwork = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const formData: ArtworkFormData = {
          title: data.title || "",
          artist: data.artist || "",
          description: data.description || "",
          created_year: data.created_year || "",
          dimensions: data.dimensions || "",
          format: data.format || "",
          starting_price: data.starting_price || 0,
          image_url: data.image_url || "",
          status: data.status || "draft",
          end_date: data.end_date || null
        };
        setArtwork(formData);
      }
    } catch (error) {
      console.error("Error fetching artwork:", error);
      toast({
        title: "Error",
        description: "Failed to fetch artwork details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: ArtworkFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("artworks")
        .update(formData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Artwork updated successfully",
      });
      navigate("/admin");
    } catch (error) {
      console.error("Error updating artwork:", error);
      toast({
        title: "Error",
        description: "Failed to update artwork",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Edit Artwork" : "Create New Artwork"}
      </h1>
      {artwork && (
        <ArtworkForm 
          defaultValues={artwork} 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AdminArtwork;