import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./AccountSettings";
import { NotificationPreferences } from "./NotificationPreferences";
import { AuctionParticipation } from "./AuctionParticipation";
import { WonAuctions } from "./WonAuctions";
import { PaymentMethodsManager } from "./PaymentMethodsManager";

export const ProfileTabs = ({ user }: { user: any }) => {
  return (
    <Tabs defaultValue="account" className="space-y-4">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="auctions">My Auctions</TabsTrigger>
        <TabsTrigger value="won">Won Auctions</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings user={user} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPreferences />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentMethodsManager />
      </TabsContent>

      <TabsContent value="auctions">
        <AuctionParticipation userId={user.id} />
      </TabsContent>

      <TabsContent value="won">
        <WonAuctions userId={user.id} />
      </TabsContent>
    </Tabs>
  );
};