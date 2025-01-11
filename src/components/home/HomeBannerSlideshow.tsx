import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { useState } from "react";

export const HomeBannerSlideshow = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const { data: banners, isLoading, error } = useQuery({
    queryKey: ["homepage-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleImageLoad = (bannerId: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [bannerId]: true
    }));
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load banner slideshow. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[80vh]" />;
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const autoplayBanner = banners.find(banner => banner.autoplay);
  const autoplayOptions = [
    Autoplay({
      delay: autoplayBanner?.autoplay_interval || 5000,
      stopOnInteraction: false,
    }),
  ];

  return (
    <div className="relative">
      <Carousel 
        className="h-[80vh]"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={autoplayOptions}
      >
        <CarouselContent className="-ml-0">
          <AnimatePresence>
            {banners.map((banner) => (
              <CarouselItem key={banner.id} className="pl-0">
                <div className="relative h-[80vh] overflow-hidden">
                  <div className="absolute inset-0">
                    {/* Blur placeholder */}
                    <div 
                      className={`absolute inset-0 bg-gray-100 transition-opacity duration-500 ${
                        loadedImages[banner.id] ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{ 
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                    />
                    
                    {/* Main image */}
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        loadedImages[banner.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(banner.id)}
                      loading="eager"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-full flex items-end"
                  >
                    <div className="max-w-[1400px] mx-auto px-6 pb-20 w-full">
                      <div className="max-w-2xl text-white space-y-4">
                        <h1 className="text-4xl font-serif">{banner.title}</h1>
                        {banner.description && (
                          <p className="text-sm text-gray-200 max-w-lg">
                            {banner.description}
                          </p>
                        )}
                        {banner.button_text && banner.button_link && (
                          <Button 
                            className="mt-6 bg-white text-black hover:bg-white/90 transition-colors duration-300"
                            onClick={() => window.location.href = banner.button_link}
                          >
                            {banner.button_text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </AnimatePresence>
        </CarouselContent>
      </Carousel>
    </div>
  );
};