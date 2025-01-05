import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Database Connection</span>
            <span className="text-green-500">Connected</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Storage Service</span>
            <span className="text-green-500">Online</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Email Service</span>
            <span className="text-green-500">Operational</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};