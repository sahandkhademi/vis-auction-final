export interface Artist {
  id: string;
  name: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ArtworkWithArtist {
  id: string;
  title: string;
  artist: string | Artist;
  description: string | null;
  created_year: string | null;
  dimensions: string | null;
  format: string | null;
  starting_price: number;
  current_price: number | null;
  image_url: string | null;
  status: string | null;
  end_date: string | null;
  completion_status: string | null;
  payment_status: string | null;
  winner_id: string | null;
}