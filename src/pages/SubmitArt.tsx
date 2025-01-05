import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SubmitArt = () => {
  const isMobile = useIsMobile();

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-4xl mb-6">Submit Your Art</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <p className="text-lg text-gray-700">
          Thank you for your interest in submitting your artwork to VIS Auction. We're currently accepting submissions via email.
        </p>

        <div className="bg-secondary/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Submit</h2>
          <p className="text-gray-700 mb-4">
            Please send us an email with the following information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Your full name and contact information</li>
            <li>A brief artist biography</li>
            <li>High-quality images of your artwork</li>
            <li>Details about each piece (title, medium, dimensions, year)</li>
            <li>Your asking price or reserve price</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <a 
            href="mailto:support@visauction.com"
            className="inline-block w-full sm:w-auto"
          >
            <Button className={`w-full sm:w-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
              <Mail className={`${isMobile ? 'size-4' : 'size-5'} mr-2`} />
              {isMobile ? 'Contact Us' : 'Contact us at support@visauction.com'}
            </Button>
          </a>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Our team will review your submission and get back to you within 2-3 business days.
        </p>
      </div>
    </div>
  );
};

export default SubmitArt;