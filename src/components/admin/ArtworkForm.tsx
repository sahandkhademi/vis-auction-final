import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ArtworkFormData } from "@/types/artwork";
import { ArtistSelect } from "./artwork-form/ArtistSelect";
import { BasicInfo } from "./artwork-form/BasicInfo";
import { ArtworkDetails } from "./artwork-form/ArtworkDetails";
import { AuctionSettings } from "./artwork-form/AuctionSettings";
import { ImageUpload } from "./artwork-form/ImageUpload";
import { FormActions } from "./artwork-form/FormActions";

interface ArtworkFormProps {
  defaultValues: Partial<ArtworkFormData>;
  onSubmit: (data: ArtworkFormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export const ArtworkForm = ({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: ArtworkFormProps) => {
  const form = useForm<ArtworkFormData>({
    defaultValues: {
      title: "",
      artist: "",
      artist_id: "",
      description: "",
      created_year: "",
      dimensions: "",
      format: "",
      starting_price: 0,
      image_url: "",
      status: "draft",
      end_date: null,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfo form={form} />
        <ArtistSelect form={form} isLoading={isLoading} />
        <ArtworkDetails form={form} />
        <ImageUpload form={form} />
        <AuctionSettings form={form} isLoading={isLoading} />
        <FormActions isLoading={isLoading} onCancel={onCancel} />
      </form>
    </Form>
  );
};