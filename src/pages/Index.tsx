import { HomeBannerSlideshow } from "@/components/home/HomeBannerSlideshow";
import { TrendingAuctions } from "@/components/home/TrendingAuctions";

const Index = () => {
  return (
    <div className="min-h-screen bg-white -mt-24">
      <HomeBannerSlideshow />
      <TrendingAuctions />
    </div>
  );
};

export default Index;