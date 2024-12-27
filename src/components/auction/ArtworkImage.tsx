import { motion } from "framer-motion";

interface ArtworkImageProps {
  imageUrl: string | null;
  title: string;
}

export const ArtworkImage = ({ imageUrl, title }: ArtworkImageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <img
        src={imageUrl || '/placeholder.svg'}
        alt={title}
        className="w-full h-auto"
      />
    </motion.div>
  );
};