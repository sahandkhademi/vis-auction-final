import { lazy, Suspense } from "react";

const AdminDashboard = lazy(() => import("./admin/dashboard/AdminDashboard"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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