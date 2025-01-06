import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const usePaymentStatus = (refetchAuction: () => Promise<void>) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      refetchAuction();
      toast.success(
        "Payment successful! You'll receive a confirmation email shortly.",
        { duration: 5000 }
      );
    }
  }, [searchParams, refetchAuction]);
};