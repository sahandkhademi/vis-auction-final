import { motion } from "framer-motion";
import { EmailTester } from "../EmailTester";
import { BasicStats } from "./analytics/BasicStats";
import { RevenueChart } from "./analytics/RevenueChart";
import { EngagementMetrics } from "./analytics/EngagementMetrics";
import { SystemStatus } from "./analytics/SystemStatus";

export const AdminAnalytics = () => {
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
        <BasicStats />
        <RevenueChart />
        <EngagementMetrics />
        <SystemStatus />
      </motion.div>
    </div>
  );
};