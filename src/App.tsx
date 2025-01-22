import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, lazy, useEffect } from "react";
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
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));

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

// Track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      console.log("Recording page view for:", location.pathname);
      const { data, error } = await supabase
        .from('website_visits')
        .insert([{ 
          path: location.pathname,
          user_agent: navigator.userAgent,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          platform: navigator.platform
        }]);

      if (error) {
        console.error("Error recording visit:", error);
      } else {
        console.log("Visit recorded successfully:", data);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background">
            <PageViewTracker />
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
                  <Route path="/how-it-works" element={<HowItWorks />} />
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