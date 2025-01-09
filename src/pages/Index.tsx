import { HomeBannerSlideshow } from "@/components/home/HomeBannerSlideshow";
import { TrendingAuctions } from "@/components/home/TrendingAuctions";

const Index = () => {
  return (
    <div className="min-h-screen bg-white -mt-24">
      <HomeBannerSlideshow />
      <div className="container py-8">
        <h2 className="text-3xl font-bold mb-6">Trending Auctions</h2>
        <TrendingAuctions />
      </div>
    </div>
  );
};

export default Index;