import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const BackupManagement = () => {
  const queryClient = useQueryClient();

  const initiateBackupMutation = useMutation({
    mutationFn: async (backupType: string) => {
      const { data, error } = await supabase
        .rpc('initiate_backup', { p_backup_type: backupType });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Backup initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
    },
    onError: (error) => {
      console.error("Error initiating backup:", error);
      toast.error("Failed to initiate backup");
    },
  });

  const handleInitiateBackup = (type: string) => {
    initiateBackupMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button 
              onClick={() => handleInitiateBackup('full')}
              disabled={initiateBackupMutation.isPending}
              className="flex-1"
            >
              {initiateBackupMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Full Backup
            </Button>
            <Button 
              variant="secondary"
              onClick={() => handleInitiateBackup('incremental')}
              disabled={initiateBackupMutation.isPending}
              className="flex-1"
            >
              {initiateBackupMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Incremental Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};