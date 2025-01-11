import { motion } from "framer-motion";
import { generateWebPUrl, generateSrcSet } from "@/utils/imageUtils";
import { useState } from "react";

interface ArtworkImageProps {
  imageUrl: string | null;
  title: string;
}

export const ArtworkImage = ({ imageUrl, title }: ArtworkImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div 
        className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`} 
        style={{ 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      />
      
      <picture>
        <source
          type="image/webp"
          srcSet={generateSrcSet(generateWebPUrl(imageUrl || '/placeholder.svg'))}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={title}
          className={`w-full h-auto transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </picture>
    </motion.div>
  );
};