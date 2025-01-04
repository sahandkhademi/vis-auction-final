import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            How do I participate in auctions?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            To participate in auctions, you need to create an account and sign in. Once signed in, you can browse active auctions and place bids on artworks that interest you. Make sure to review the artwork details and bidding history before placing your bid.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            How do I submit my artwork?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            To submit your artwork, please email us at support@visauction.com with high-quality images of your work, your artist biography, and details about each piece. Our team will review your submission and get back to you within 2-3 business days.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            What happens after I win an auction?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            After winning an auction, you'll receive a notification with payment instructions. You have 48 hours to complete the payment. Once payment is confirmed, we'll coordinate with you regarding shipping arrangements for your artwork.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            What payment methods do you accept?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            We accept major credit cards (Visa, MasterCard, American Express) and secure online payments through our payment processor. All transactions are encrypted and secure.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            What is your shipping policy?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            All artworks are carefully packaged and shipped via insured carriers. Shipping costs vary based on the size of the artwork and destination. Detailed shipping information will be provided after winning an auction.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="border rounded-lg p-4">
          <AccordionTrigger className="text-lg font-semibold">
            Can I cancel my bid?
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-gray-600">
            Once placed, bids cannot be cancelled or retracted. Please make sure you're certain about your bid amount before submitting it. If you have any concerns, contact our support team immediately.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQ;