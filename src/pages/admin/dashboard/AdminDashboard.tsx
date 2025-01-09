import { Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuctionsList } from "./AuctionsList";
import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { UsersList } from "./UsersList";

const AdminDashboard = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <Monitor className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-extrabold mb-2">Desktop View Required</h1>
        <p className="text-muted-foreground">
          The admin dashboard is optimized for desktop viewing. Please access it from a larger screen for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your gallery's content and operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AuctionsList />
          <UsersList />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
};

export default AdminDashboard;