import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, History, ChartBar, Bell, Settings } from "lucide-react";
import { WonAuctions } from "./WonAuctions";
import { UserBidHistory } from "./UserBidHistory";
import { UserStats } from "./UserStats";
import { AccountSettings } from "./AccountSettings";
import { NotificationPreferences } from "./NotificationPreferences";
import { AuctionParticipation } from "./AuctionParticipation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

interface ProfileTabsProps {
  user: User | null;
}

export const ProfileTabs = ({ user }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="won" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="won" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <Trophy className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Won</span>
          <span className="md:hidden">Won</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <History className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Activity</span>
          <span className="md:hidden">Bids</span>
        </TabsTrigger>
        <TabsTrigger value="participation" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <ChartBar className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Participation</span>
          <span className="md:hidden">Part.</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <ChartBar className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Statistics</span>
          <span className="md:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <Bell className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Notifications</span>
          <span className="md:hidden">Notif.</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-1 text-xs md:text-sm md:gap-2">
          <Settings className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Settings</span>
          <span className="md:hidden">Set.</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="won">
        <Card>
          <CardHeader>
            <CardTitle>Won Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            {user && <WonAuctions userId={user.id} />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>Bid History</CardTitle>
          </CardHeader>
          <CardContent>
            {user && <UserBidHistory userId={user.id} />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="participation">
        <Card>
          <CardHeader>
            <CardTitle>Auction Participation</CardTitle>
          </CardHeader>
          <CardContent>
            {user && <AuctionParticipation userId={user.id} />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <UserStats userId={user?.id} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPreferences user={user} />
      </TabsContent>

      <TabsContent value="settings">
        <AccountSettings user={user} />
      </TabsContent>
    </Tabs>
  );
};