import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Database Connection</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex justify-between items-center">
            <span>Storage Service</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex justify-between items-center">
            <span>Email Service</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};