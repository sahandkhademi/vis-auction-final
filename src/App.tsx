import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, lazy } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { Skeleton } from "./components/ui/skeleton";

const queryClient = new QueryClient();

// Lazy load route components
const Auth = lazy(() => import("@/pages/Auth"));
const Index = lazy(() => import("@/pages/Index"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminDashboard = lazy(() => import("@/pages/Admin"));
const AdminArtwork = lazy(() => import("@/pages/AdminArtwork"));
const AuctionDetail = lazy(() => import("@/pages/AuctionDetail"));
const ArtistDetail = lazy(() => import("@/pages/ArtistDetail"));
const About = lazy(() => import("@/pages/About"));
const Auctions = lazy(() => import("@/pages/Auctions"));
const SubmitArt = lazy(() => import("@/pages/SubmitArt"));
const FAQ = lazy(() => import("@/pages/FAQ"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-3xl px-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className={`flex-grow ${location.pathname.startsWith('/auction/') ? 'pt-6' : 'pt-24'} pb-16`}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/artwork/:id" element={<AdminArtwork />} />
                  <Route path="/auction/:id" element={<AuctionDetail />} />
                  <Route path="/artist/:id" element={<ArtistDetail />} />
                  <Route path="/auctions" element={<Auctions />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/submit-art" element={<SubmitArt />} />
                  <Route path="/faq" element={<FAQ />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </BrowserRouter>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;