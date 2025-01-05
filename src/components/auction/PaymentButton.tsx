import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentButtonProps {
  auctionId: string;
  disabled?: boolean;
}

export const PaymentButton = ({ auctionId, disabled }: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      console.log('🔔 Initiating payment for auction:', auctionId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { auctionId },
      });

      console.log('Response from create-checkout-session:', { data, error });

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
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full"
    >
      {isLoading ? "Processing..." : "Pay Now"}
    </Button>
  );
};