import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const PlatformUsage = () => {
  const { data: deviceData } = useQuery({
    queryKey: ["platform-usage"],
    queryFn: async () => {
      // Get device types distribution
      const { data: devices, error: deviceError } = await supabase
        .from("website_visits")
        .select("device_type, count")
        .not("device_type", "is", null)
        .select("device_type")
        .then(({ data, error }) => {
          if (error) throw error;
          const counts = data.reduce((acc, { device_type }) => {
            acc[device_type || 'unknown'] = (acc[device_type || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts).map(([name, value]) => ({ name, value }));
        });

      if (deviceError) throw deviceError;

      // Get platform distribution
      const { data: platforms, error: platformError } = await supabase
        .from("website_visits")
        .select("platform")
        .not("platform", "is", null)
        .then(({ data, error }) => {
          if (error) throw error;
          const counts = data.reduce((acc, { platform }) => {
            acc[platform || 'unknown'] = (acc[platform || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts).map(([name, value]) => ({ name, value }));
        });

      if (platformError) throw platformError;

      return {
        devices,
        platforms,
      };
    },
  });

  const COLORS = ['#C6A07C', '#B89068', '#A98054', '#9A7040', '#8B602C'];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Platform & Device Usage</CardTitle>
        <CardDescription>Distribution of visits by platform and device type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-4">Device Types</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataOrEmpty(data?.devices)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataOrEmpty(data?.devices).map((entry, index) => (
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
                  data={dataOrEmpty(data?.platforms)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataOrEmpty(data?.platforms).map((entry, index) => (
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

const dataOrEmpty = (data: any[] | undefined) => {
  return data || [];
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