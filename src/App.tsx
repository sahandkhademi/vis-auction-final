import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/Admin";
import AdminArtwork from "@/pages/AdminArtwork";
import AuctionDetail from "@/pages/AuctionDetail";
import ArtistDetail from "@/pages/ArtistDetail";
import About from "@/pages/About";
import Auctions from "@/pages/Auctions";
import SubmitArt from "@/pages/SubmitArt";
import FAQ from "@/pages/FAQ";

const queryClient = new QueryClient();

// Pages that need less top padding
const reducedPaddingRoutes = [
  '/auction',
  '/artist',
  '/profile',
  '/admin',
  '/submit-art',
  '/faq'
];

// Pages that need more padding for content
const contentPaddingRoutes = [
  '/auctions'
];

function AppContent() {
  const location = useLocation();
  const needsReducedPadding = reducedPaddingRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  const needsContentPadding = contentPaddingRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  const getPaddingClass = () => {
    if (needsReducedPadding) return 'pt-6';
    if (needsContentPadding) return 'pt-32 px-8';
    return 'pt-24';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className={`flex-grow ${getPaddingClass()} pb-16`}>
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
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;