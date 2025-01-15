import { AlertTriangle } from "lucide-react";

interface PaymentFailureStatusProps {
  show: boolean;
}

export const PaymentFailureStatus = ({ show }: PaymentFailureStatusProps) => {
  if (!show) return null;

  return (
    <div className="rounded-lg border p-6 bg-destructive/10 border-destructive/20">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">
            Payment Processing Failed
          </h3>
        </div>
        <p className="text-sm text-destructive/90 pl-9">
          We were unable to process your payment automatically. Don't worry - you'll receive an email shortly with instructions to complete your payment manually.
        </p>
      </div>
    </div>
  );
};