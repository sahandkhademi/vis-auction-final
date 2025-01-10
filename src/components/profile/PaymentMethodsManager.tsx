import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PaymentMethodsManager = () => {
  const session = useSession();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const { data: paymentMethods, refetch } = useQuery({
    queryKey: ["payment-methods", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];

      try {
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_valid', true);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }
    },
    enabled: !!session?.user,
  });

  const handleSetupPayment = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add a payment method");
      return;
    }

    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { data, error } = await supabase.functions.invoke('setup-payment-method');
      
      if (error) throw error;
      if (!data?.clientSecret) throw new Error('No client secret received');

      const { error: stripeError } = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // This is for testing only
          },
        },
      });

      if (stripeError) {
        throw stripeError;
      }

      toast.success("Payment method added successfully");
      refetch();
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
        {paymentMethods && paymentMethods.length > 0 ? (
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
          {isLoading ? "Setting up..." : "Add Payment Method"}
        </Button>
      </CardContent>
    </Card>
  );
};