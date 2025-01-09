import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";

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

export const HomepageBanners = () => {
  const { data: banners } = useQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });

  if (!banners?.length) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <Carousel className="relative">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white p-8">
                  <h2 className="text-4xl font-bold mb-4">{banner.title}</h2>
                  {banner.description && (
                    <p className="text-lg mb-6">{banner.description}</p>
                  )}
                  {banner.button_text && banner.button_link && (
                    <Link to={banner.button_link}>
                      <Button variant="secondary" size="lg">
                        {banner.button_text}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};