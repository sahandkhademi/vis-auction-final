import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PaymentButton } from "./PaymentButton";

interface PaymentStatusProps {
  hasCompletedPayment: boolean;
  needsPayment: boolean;
  isEnded: boolean;
  auctionId: string;
  currentBid: number;
}

export const PaymentStatus = ({
  hasCompletedPayment,
  needsPayment,
  isEnded,
  auctionId,
  currentBid,
}: PaymentStatusProps) => {
  return (
    <>
      {hasCompletedPayment && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Payment Completed!</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your payment! Your purchase has been confirmed. You should have received a confirmation email with further details.
          </AlertDescription>
        </Alert>
      )}

      {needsPayment && isEnded && !hasCompletedPayment && (
        <div className="mt-4">
          <PaymentButton 
            auctionId={auctionId} 
            currentPrice={currentBid}
          />
        </div>
      )}
    </>
  );
};