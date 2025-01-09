import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-4xl mb-6">Frequently Asked Questions</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              How do I participate in auctions?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              To participate in auctions, you need to create an account and verify your email address. Once logged in, you can browse active auctions and place bids on artworks that interest you.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              What payment methods do you accept?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We accept major credit cards, debit cards, and various digital payment methods. All payments are processed securely through our payment provider.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              How do I submit my artwork?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Artists can submit their work through our submission form. We review all submissions carefully and will contact you within 2-3 business days regarding your artwork.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              What happens after I win an auction?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              After winning an auction, you'll receive a notification with payment instructions. Once payment is completed, we'll coordinate the delivery of your artwork.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              What is your shipping policy?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We work with professional art handlers to ensure safe delivery. Shipping costs vary based on size, weight, and destination. Detailed shipping information is provided after auction completion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Still have questions? Contact our support team for assistance.
      </p>
    </div>
  );
};

export default FAQ;