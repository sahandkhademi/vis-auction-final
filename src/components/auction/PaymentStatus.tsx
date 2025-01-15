import { CheckCircle2 } from "lucide-react";
import { PaymentFailureStatus } from "./PaymentFailureStatus";

interface PaymentStatusProps {
  hasCompletedPayment: boolean;
  needsPayment: boolean;
  isEnded: boolean;
  hasFailedPayment?: boolean;
}

export const PaymentStatus = ({
  hasCompletedPayment,
  needsPayment,
  isEnded,
  hasFailedPayment = false
}: PaymentStatusProps) => {
  if (!isEnded || (!hasCompletedPayment && !needsPayment && !hasFailedPayment)) {
    return null;
  }

  if (hasFailedPayment) {
    return <PaymentFailureStatus show={true} />;
  }

  if (hasCompletedPayment) {
    return (
      <div className="rounded-lg border p-6 bg-green-50 border-green-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-800">
              Payment Successful!
            </h3>
          </div>
          <p className="text-sm text-green-700 pl-9">
            Thank you for your payment. We will be in touch shortly with details about your artwork delivery.
          </p>
        </div>
      </div>
    );
  }

  return null;
};