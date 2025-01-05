import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PaymentButtonProps {
  auctionId: string;
  currentPrice: number;
  disabled?: boolean;
}

export const PaymentButton = ({ auctionId, currentPrice, disabled }: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      console.log('🔔 Initiating payment for auction:', auctionId, 'amount:', currentPrice);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          auctionId,
          amount: currentPrice 
        },
      });

      console.log('Response from create-stripe-checkout:', { data, error });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      console.log('✅ Redirecting to checkout URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
      
      <Alert variant="destructive" className="bg-destructive/10 border-none">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm text-destructive">
          If payment is not completed within 48 hours, you will lose your winning bid and the next highest bidder will be selected.
        </AlertDescription>
      </Alert>
    </div>
  );
};