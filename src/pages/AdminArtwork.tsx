import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkFormData, ArtworkStatus } from "@/types/artwork";

const AdminArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<ArtworkFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch artwork data if we're editing an existing artwork
    if (id && id !== 'new') {
      fetchArtwork();
    } else {
      // Set default values for new artwork
      setArtwork({
        title: "",
        artist: "",
        description: "",
        created_year: "",
        dimensions: "",
        format: "",
        starting_price: 0,
        image_url: "",
        status: "draft",
        end_date: null
      });
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
          status: (data.status as ArtworkStatus) || "draft",
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
      
      if (id && id !== 'new') {
        // Update existing artwork
        const { error } = await supabase
          .from("artworks")
          .update(formData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Artwork updated successfully",
        });
      } else {
        // Create new artwork
        const { error } = await supabase
          .from("artworks")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Artwork created successfully",
        });
      }
      
      navigate("/admin");
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Error",
        description: "Failed to save artwork",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  if (isLoading && !artwork) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id && id !== 'new' ? "Edit Artwork" : "Create New Artwork"}
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