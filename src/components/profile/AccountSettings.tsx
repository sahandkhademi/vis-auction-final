import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AccountSettings = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully signed out");
    navigate("/auth");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};