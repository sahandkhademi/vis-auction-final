export type ArtworkStatus = "draft" | "published" | "sold" | "archived";

export interface ArtworkFormData {
  title: string;
  artist: string;
  description: string;
  created_year: string;
  dimensions: string;
  format: string;
  starting_price: number;
  image_url: string;
  status: ArtworkStatus;
  end_date: string | null;
}

export interface ArtworkData extends ArtworkFormData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  current_price: number | null;
}