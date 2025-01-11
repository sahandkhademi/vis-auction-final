import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              What is a bid?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              A bid is the amount of money you’re willing to pay for an item. For example, if an artwork starts at $10, you can bid $10 or more. If someone bids $15 after you, you’ll need to offer a higher amount, like $20, to stay in the auction.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              What happens if I’m outbid?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              If someone offers more than your bid, you’ll receive an email notification. You can choose to place a higher bid or let the other person win.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              Is bidding free?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! You only pay if you win the auction. Adding a payment method ensures that payment is processed if you win.
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
              What happens if I win?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              If you have the highest bid when the auction closes, the item is yours! Your payment method will be charged, and you’ll receive an email with details about the item and shipping. Pick up is also available at school. 
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      

      <AccordionItem value="item-6" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              Is my payment information safe?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Absolutely! All payments on our platform are processed securely through Stripe, a trusted and industry-leading payment processor. Stripe uses advanced encryption and security measures to keep your payment details completely safe.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      <AccordionItem value="item-7" className="border-none">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              Can I trust the platform with my credit card details?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! Your payment information is never stored on our servers. Stripe handles all transactions securely, so your details are fully encrypted and protected.
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
