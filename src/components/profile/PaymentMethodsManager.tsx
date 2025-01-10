import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const PaymentMethodsManager = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_valid', true);

        if (error) throw error;
        setPaymentMethods(data || []);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, [session?.user]);

  const handleSetupPayment = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add a payment method");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-payment-method');
      
      if (error) throw error;

      if (!data?.url) {
        throw new Error('No setup URL received');
      }

      // Redirect to Stripe's hosted setup page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast.error("Failed to set up payment method");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">{method.card_brand}</p>
                    <p className="text-sm text-muted-foreground">
                      **** **** **** {method.last_four}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No payment methods</AlertTitle>
            <AlertDescription>
              You haven't added any payment methods yet.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSetupPayment}
          disabled={isLoading}
          className="w-full"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </CardContent>
    </Card>
  );
};