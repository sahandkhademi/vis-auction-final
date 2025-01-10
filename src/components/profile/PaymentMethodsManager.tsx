import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PaymentMethodsManager = () => {
  const session = useSession();
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
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession.session?.access_token) {
        toast.error("Please sign in again");
        await supabase.auth.signOut();
        return;
      }

      console.log('Calling setup-payment-method endpoint...');
      const { data, error } = await supabase.functions.invoke('setup-payment-method', {
        headers: {
          Authorization: `Bearer ${currentSession.session.access_token}`,
        },
      });

      if (error) {
        console.error('Setup payment error:', error);
        toast.error("Unable to setup payment method. Please try again later.");
        return;
      }

      if (!data?.clientSecret) {
        console.error('No client secret received:', data);
        toast.error("Payment setup unavailable. Please try again later.");
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        toast.error('Payment system unavailable. Please try again later.');
        return;
      }

      console.log('Redirecting to Stripe setup...');
      const { error: setupError } = await stripe.confirmSetup({
        clientSecret: data.clientSecret,
        elements: undefined,
        confirmParams: {
          return_url: `${window.location.origin}/profile?setup_success=true`,
          payment_method_data: {
            billing_details: {
              email: session.user.email,
            },
          },
        },
      });

      if (setupError) {
        console.error('Stripe setup error:', setupError);
        toast.error("Unable to setup payment method. Please try again later.");
        return;
      }
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast.error("We're experiencing technical difficulties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const setupSuccess = searchParams.get('setup_success');
    
    if (setupSuccess === 'true') {
      toast.success("Payment method added successfully");
      refetch();
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [refetch]);

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