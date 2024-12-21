import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import AuctionDetail from "./pages/AuctionDetail";
import ArtistProfile from "./pages/ArtistProfile";
import Auctions from "./pages/Auctions";
import BuySelling from "./pages/BuySelling";
import PrivateSales from "./pages/PrivateSales";
import Services from "./pages/Services";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
              <Route path="/artist/:id" element={<ArtistProfile />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/buy-selling" element={<BuySelling />} />
              <Route path="/private-sales" element={<PrivateSales />} />
              <Route path="/services" element={<Services />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;