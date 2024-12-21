import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const Navigation = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-serif">
            MOSAIC
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/auctions" className="text-sm hover:text-gray-600 transition-colors">
              Auctions
            </Link>
            <Link to="/buy-selling" className="text-sm hover:text-gray-600 transition-colors">
              Buy/Selling
            </Link>
            <Link to="/private-sales" className="text-sm hover:text-gray-600 transition-colors">
              Private sales
            </Link>
            <Link to="/services" className="text-sm hover:text-gray-600 transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm hover:text-gray-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2">
                  <Search className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>Search Artworks</SheetTitle>
                  <SheetDescription>
                    <input
                      type="search"
                      placeholder="Search for artworks, artists, or collections..."
                      className="w-full p-2 border rounded-md mt-4"
                    />
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2">
                  <User className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Account</DialogTitle>
                  <DialogDescription>
                    <div className="space-y-4 mt-4">
                      <Button className="w-full" variant="outline">Sign In</Button>
                      <Button className="w-full">Sign Up</Button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;