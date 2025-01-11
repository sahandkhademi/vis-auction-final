import { HomeBannerSlideshow } from "@/components/home/HomeBannerSlideshow";
import { TrendingAuctions } from "@/components/home/TrendingAuctions";
import { UpcomingAuctions } from "@/components/home/UpcomingAuctions";

const Index = () => {
  return (
    <div className="min-h-screen bg-white -mt-24">
      <HomeBannerSlideshow />
      <div className="container py-8">
        <TrendingAuctions />
        <UpcomingAuctions />
      </div>
    </div>
  );
};

export default Index;