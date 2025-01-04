export interface SearchResults {
  artworks: {
    id: string;
    title: string;
    artist: string;
  }[];
  artists: {
    id: string;
    name: string;
  }[];
}