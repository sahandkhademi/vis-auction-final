import { CheckCircle2 } from "lucide-react";

interface PaymentStatusProps {
  hasCompletedPayment: boolean;
  needsPayment: boolean;
  isEnded: boolean;
}

export const PaymentStatus = ({
  hasCompletedPayment,
  needsPayment,
  isEnded
}: PaymentStatusProps) => {
  if (!isEnded || (!hasCompletedPayment && !needsPayment)) {
    return null;
  }

  if (hasCompletedPayment) {
    return (
      <div className="rounded-lg border p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700 font-medium">
            Thank you for your payment!
          </p>
        </div>
      </div>
    );
  }

  return null;
};