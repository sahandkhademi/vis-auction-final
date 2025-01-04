import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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
  const { data: backupLogs, isLoading } = useQuery({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as BackupLog[];
    },
  });

  if (isLoading) {
    return <div>Loading backup logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {backupLogs?.map((log) => (
              <div
                key={log.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};