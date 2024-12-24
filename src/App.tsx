import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/Admin";
import AdminArtwork from "@/pages/AdminArtwork";
import AuctionDetail from "@/pages/AuctionDetail";
import About from "@/pages/About";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/artwork/:id" element={<AdminArtwork />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Footer />
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
