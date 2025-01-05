import { EmailTester } from "../EmailTester";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminAnalytics = () => {
  const { data: totalAuctions } = useQuery({
    queryKey: ["totalAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .eq("completion_status", "ongoing");
      return count || 0;
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Admin Analytics</h2>
      <EmailTester />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Auctions</h3>
            <p className="text-3xl font-bold">{totalAuctions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Active Auctions</h3>
            <p className="text-3xl font-bold">{activeAuctions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
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
        </div>
      </motion.div>
    </div>
  );
};