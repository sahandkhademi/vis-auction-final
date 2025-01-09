import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = lazy(() => import("./admin/dashboard/AdminDashboard"));

const LoadingFallback = () => (
  <div className="container py-8 space-y-8 animate-fadeIn">
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full" />
    </div>
  </div>
);

const Admin = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
};

export default Admin;