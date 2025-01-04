import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { NavigationLinks } from "./NavigationLinks";

interface MobileNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setOpen: (open: boolean) => void;
}

export const MobileNav = ({ mobileMenuOpen, setMobileMenuOpen, setOpen }: MobileNavProps) => {
  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 ml-2">
          <Menu className="h-[1.25rem] w-[1.25rem]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-4 mt-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors justify-start"
            onClick={() => {
              setOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
          {NavigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};