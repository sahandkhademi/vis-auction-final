import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, HardDrive, Mail } from "lucide-react";

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span>Database Connection</span>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <span>Storage Service</span>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>Email Service</span>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};