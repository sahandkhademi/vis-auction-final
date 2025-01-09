import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BackupLog = {
  id: string;
  backup_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  file_name: string | null;
  file_size: number | null;
  error_message: string | null;
};

export const BackupMonitoring = () => {
  const queryClient = useQueryClient();

  const { data: backupLogs, isLoading, error } = useQuery({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("started_at", { ascending: false });

      if (error) {
        console.error("Error fetching backup logs:", error);
        throw error;
      }

      // Check for any stuck backups (in progress for more than 10 minutes)
      const stuckBackups = data?.filter(log => {
        if (log.status === 'in_progress') {
          const startedAt = new Date(log.started_at || '');
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          return startedAt < tenMinutesAgo;
        }
        return false;
      });

      // Update stuck backups to failed status
      if (stuckBackups && stuckBackups.length > 0) {
        await Promise.all(stuckBackups.map(async (log) => {
          const { error: updateError } = await supabase
            .from('backup_logs')
            .update({
              status: 'failed',
              error_message: 'Backup timed out after 10 minutes',
              completed_at: new Date().toISOString()
            })
            .eq('id', log.id);

          if (updateError) {
            console.error('Error updating stuck backup:', updateError);
          }
        }));
      }

      return data as BackupLog[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const initiateBackupMutation = useMutation({
    mutationFn: async (backupType: string) => {
      // First, check if there's already a backup in progress
      const { data: inProgressBackups } = await supabase
        .from('backup_logs')
        .select('*')
        .eq('status', 'in_progress');

      if (inProgressBackups && inProgressBackups.length > 0) {
        throw new Error('A backup is already in progress');
      }

      const { data, error } = await supabase
        .rpc('initiate_backup', { p_backup_type: backupType });
      
      if (error) throw error;

      // Simulate backup completion after 5 seconds (for demonstration)
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('backup_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_name: `backup_${backupType}_${new Date().toISOString()}.sql`,
            file_size: Math.floor(Math.random() * 1000000) + 500000 // Random size between 500KB and 1.5MB
          })
          .eq('id', data);

        if (updateError) {
          console.error('Error updating backup status:', updateError);
        } else {
          queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
        }
      }, 5000);

      return data;
    },
    onSuccess: () => {
      toast.success("Backup initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
    },
    onError: (error) => {
      console.error("Error initiating backup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate backup");
    },
  });

  const handleInitiateBackup = (type: string) => {
    initiateBackupMutation.mutate(type);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading backup logs. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Backup Monitoring</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleInitiateBackup('full')}
            disabled={initiateBackupMutation.isPending}
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
          >
            {initiateBackupMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Incremental Backup
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {(!backupLogs || backupLogs.length === 0) ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-muted-foreground">No backup logs available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backupLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <div>
                        <h3 className="font-medium">{log.backup_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className={`font-medium ${
                            log.status === "completed" ? "text-green-600" :
                            log.status === "failed" ? "text-red-600" :
                            "text-yellow-600"
                          }`}>{log.status}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.started_at), "PPp")}
                    </p>
                  </div>
                  {log.file_name && (
                    <p className="text-sm">File: {log.file_name}</p>
                  )}
                  {log.file_size && (
                    <p className="text-sm">Size: {(log.file_size / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                  {log.error_message && (
                    <p className="text-sm text-red-600 mt-2">{log.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};