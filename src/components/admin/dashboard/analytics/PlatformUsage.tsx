import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const PlatformUsage = () => {
  const { data: deviceData, error: deviceError } = useQuery({
    queryKey: ["platform-usage-devices"],
    queryFn: async () => {
      console.log("Fetching device data...");
      const { data, error } = await supabase
        .from("website_visits")
        .select("device_type")
        .not("device_type", "is", null);

      if (error) {
        console.error("Error fetching device data:", error);
        throw error;
      }

      console.log("Raw device data:", data);

      // Count occurrences of each device type
      const counts = data.reduce((acc: Record<string, number>, { device_type }) => {
        const type = (device_type || 'unknown').toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      console.log("Processed device counts:", counts);

      // Convert to array format for chart
      return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
    },
    retry: 2,
  });

  const { data: platformData, error: platformError } = useQuery({
    queryKey: ["platform-usage-platforms"],
    queryFn: async () => {
      console.log("Fetching platform data...");
      const { data, error } = await supabase
        .from("website_visits")
        .select("platform")
        .not("platform", "is", null);

      if (error) {
        console.error("Error fetching platform data:", error);
        throw error;
      }

      console.log("Raw platform data:", data);

      // Count occurrences of each platform
      const counts = data.reduce((acc: Record<string, number>, { platform }) => {
        const os = (platform || 'unknown').toLowerCase();
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {});

      console.log("Processed platform counts:", counts);

      // Convert to array format for chart
      return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
    },
    retry: 2,
  });

  const COLORS = Array(5).fill('#00337F').map((color, index) => {
    const opacity = 1 - (index * 0.15);
    return `rgba(0, 51, 127, ${opacity})`;
  });

  if (deviceError || platformError) {
    console.error("Device error:", deviceError);
    console.error("Platform error:", platformError);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform & Device Usage</CardTitle>
          <CardDescription>Error loading usage data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!deviceData?.length && !platformData?.length) {
    console.log("No data available. Device data:", deviceData, "Platform data:", platformData);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform & Device Usage</CardTitle>
          <CardDescription>No usage data available. Please ensure website visits are being tracked.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle>Platform & Device Usage</CardTitle>
        <CardDescription>Distribution of visits by platform and device type</CardDescription>
      </CardHeader>
      <CardContent className="pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-4">Device Types</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#00337F"
                  dataKey="value"
                >
                  {(deviceData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-4">Platforms</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#00337F"
                  dataKey="value"
                >
                  {(platformData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
