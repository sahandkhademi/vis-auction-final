interface AuctionInfoProps {
  artist: string;
  createdYear: string;
  dimensions: string;
  format: string;
}

export const AuctionInfo = ({ 
  artist, 
  createdYear, 
  dimensions, 
  format 
}: AuctionInfoProps) => {
  return (
    <div className="border-t border-gray-100 pt-8">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">
        Artwork Details
      </h3>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <dt className="text-sm text-gray-500">Artist</dt>
          <dd className="mt-1 text-gray-900">{artist}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Year</dt>
          <dd className="mt-1 text-gray-900">{createdYear}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Dimensions</dt>
          <dd className="mt-1 text-gray-900">{dimensions}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Format</dt>
          <dd className="mt-1 text-gray-900">{format}</dd>
        </div>
      </dl>
    </div>
  );
};