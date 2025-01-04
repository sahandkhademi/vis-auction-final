import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export const UserManagement = () => {
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return profiles;
    },
  });

  const handleAdminToggle = async (userId: string, currentValue: boolean) => {
    try {
      setUpdatingUser(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentValue })
        .eq("id", userId);

      if (error) throw error;
      
      toast.success("User role updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.username || "No username"}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_admin ? "default" : "secondary"}>
                    {user.is_admin ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={user.is_admin || false}
                    disabled={updatingUser === user.id}
                    onCheckedChange={() =>
                      handleAdminToggle(user.id, user.is_admin || false)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};