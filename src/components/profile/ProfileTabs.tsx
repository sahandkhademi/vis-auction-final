import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./AccountSettings";
import { NotificationPreferences } from "./NotificationPreferences";
import { AuctionParticipation } from "./AuctionParticipation";
import { WonAuctions } from "./WonAuctions";
import { PaymentMethodsManager } from "./PaymentMethodsManager";

export const ProfileTabs = ({ user }: { user: any }) => {
  return (
    <Tabs defaultValue="account" className="space-y-4 w-full">
      <TabsList className="w-full grid grid-cols-2 sm:flex sm:flex-row gap-1 bg-muted p-1">
        <TabsTrigger value="account" className="flex-grow">Account</TabsTrigger>
        <TabsTrigger value="notifications" className="flex-grow">Notifications</TabsTrigger>
        <TabsTrigger value="payments" className="flex-grow">Payments</TabsTrigger>
        <TabsTrigger value="auctions" className="flex-grow">My Auctions</TabsTrigger>
        <TabsTrigger value="won" className="flex-grow">Won Auctions</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings user={user} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPreferences user={user} />
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