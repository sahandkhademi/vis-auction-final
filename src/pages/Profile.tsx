import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { 
  UserRound, 
  History, 
  Settings,
  ChartBar,
  Bell
} from "lucide-react";
import { BidHistory } from "@/components/auction/BidHistory";
import { UserStats } from "@/components/profile/UserStats";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");
      }
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  const updateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setProfile(prev => ({ ...prev!, username }));
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
                ) : (
                  <AvatarFallback>
                    <UserRound className="h-10 w-10" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <Button 
                onClick={updateProfile} 
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
              </CardHeader>
              <CardContent>
                {user && <BidHistory auctionId={user.id} />}
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
      </div>
    </div>
  );
};

export default Profile;