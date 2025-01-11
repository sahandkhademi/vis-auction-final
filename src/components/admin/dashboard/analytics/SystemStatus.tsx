import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const SystemStatus = () => {
  const systems = [
    { name: "Database", status: "operational", uptime: "99.9%" },
    { name: "Storage", status: "operational", uptime: "99.9%" },
    { name: "Authentication", status: "operational", uptime: "99.9%" },
    { name: "Edge Functions", status: "operational", uptime: "99.9%" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of all systems</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systems.map((system) => (
            <div
              key={system.name}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(system.status)}
                <span>{system.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Uptime: {system.uptime}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};