import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <Accordion type="single" collapsible className="divide-y">
            <AccordionItem value="item-1" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                What is a bid?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                A bid is the amount of money you're willing to pay for an item. For example, if an artwork starts at $10, you can bid $10 or more. If someone bids $15 after you, you'll need to offer a higher amount, like $20, to stay in the auction.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                What happens if I'm outbid?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                If someone offers more than your bid, you'll receive an email notification. You can choose to place a higher bid or let the other person win.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                Is bidding free?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Yes! You only pay if you win the auction. Adding a payment method ensures that payment is processed if you win.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                What happens after I win an auction?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                After winning an auction, you'll receive a notification with payment instructions. Once payment is completed, we'll coordinate the delivery of your artwork.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                What happens if I win?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                If you have the highest bid when the auction closes, the item is yours! Your payment method will be charged, and you'll receive an email with details about the item and shipping. Pick up is also available at school.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                Is my payment information safe?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Absolutely! All payments on our platform are processed securely through Stripe, a trusted and industry-leading payment processor. Stripe uses advanced encryption and security measures to keep your payment details completely safe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="px-6">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-[#00337F]">
                Can I trust the platform with my credit card details?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Yes! Your payment information is never stored on our servers. Stripe handles all transactions securely, so your details are fully encrypted and protected.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-8">
          Still have questions? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
};

export default FAQ;