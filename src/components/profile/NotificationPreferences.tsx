import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPreferences {
  outbid_notifications: boolean;
  auction_ending_notifications: boolean;
  auction_won_notifications: boolean;
  marketing_notifications: boolean;
}

interface NotificationPreferencesProps {
  user: User | null;
}

export const NotificationPreferences = ({ user }: NotificationPreferencesProps) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    outbid_notifications: true,
    auction_ending_notifications: true,
    auction_won_notifications: true,
    marketing_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (error) {
      console.error("Error fetching preferences:", error);
      return;
    }

    if (data) {
      setPreferences(data);
    }
    setIsLoading(false);
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("notification_preferences")
      .update({ [key]: value })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
      return;
    }

    setPreferences((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Success",
      description: "Notification preferences updated",
    });
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you'd like to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="outbid">Outbid Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when someone outbids you
            </p>
          </div>
          <Switch
            id="outbid"
            checked={preferences.outbid_notifications}
            onCheckedChange={(checked) =>
              updatePreference("outbid_notifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ending">Auction Ending Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when auctions you're watching are ending soon
            </p>
          </div>
          <Switch
            id="ending"
            checked={preferences.auction_ending_notifications}
            onCheckedChange={(checked) =>
              updatePreference("auction_ending_notifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="won">Auction Won Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when you win an auction
            </p>
          </div>
          <Switch
            id="won"
            checked={preferences.auction_won_notifications}
            onCheckedChange={(checked) =>
              updatePreference("auction_won_notifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates about new features and special offers
            </p>
          </div>
          <Switch
            id="marketing"
            checked={preferences.marketing_notifications}
            onCheckedChange={(checked) =>
              updatePreference("marketing_notifications", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};