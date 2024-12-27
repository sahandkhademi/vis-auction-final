interface ArtworkHeaderProps {
  artistName: string;
  title: string;
  description: string | null;
}

export const ArtworkHeader = ({ artistName, title, description }: ArtworkHeaderProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-wider text-gray-500">
        {artistName}
      </p>
      <h1 className="text-4xl font-light tracking-tight text-gray-900">
        {title}
      </h1>
      <p className="text-base text-gray-600 leading-relaxed mt-4">
        {description}
      </p>
    </div>
  );
};