import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

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
      toast.error("Failed to update profile");
      setUpdating(false);
      return;
    }

    // Send profile update email using edge function
    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-update', {
        body: {
          email: user.email,
          username: username,
        }
      });

      if (emailError) {
        console.error('Failed to send profile update email:', emailError);
      }

      toast.success("Profile updated successfully");
      setProfile(prev => ({ ...prev!, username }));
    } catch (err) {
      console.error('Error in profile update:', err);
      toast.error("Profile updated but failed to send confirmation email");
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

        <ProfileTabs user={user} />
      </div>
    </div>
  );
};

export default Profile;