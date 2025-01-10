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
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SetupForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      console.error('Stripe or Elements not initialized');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting setup confirmation...');
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile?setup_success=true`,
        },
      });

      if (result.error) {
        console.error('Setup error:', result.error);
        toast.error(result.error.message || "Failed to setup payment method");
        return;
      }

      // If we get here, it means the setup was successful and the user will be redirected
      // The actual success handling happens in the useEffect that watches for URL params
    } catch (error) {
      console.error('Error in setup form:', error);
      toast.error("Payment setup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isLoading ? "Setting up..." : "Save Payment Method"}
      </Button>
    </form>
  );
};

export const PaymentMethodsManager = () => {
  const session = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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

  const initializeSetup = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add a payment method");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting payment setup process...');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        console.error('No valid session found');
        toast.error("Please sign in again");
        await supabase.auth.signOut();
        return;
      }

      console.log('Calling setup-payment-method endpoint...');
      const { data, error } = await supabase.functions.invoke('setup-payment-method', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
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

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error initializing payment setup:', error);
      toast.error("Payment setup failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const setupSuccess = searchParams.get('setup_success');
    
    if (setupSuccess === 'true') {
      // Refresh payment methods list
      refetch();
      // Reset client secret to hide the form
      setClientSecret(null);
      // Show success message
      toast.success("Payment method added successfully");
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

        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ 
            clientSecret,
            appearance: {
              theme: 'stripe'
            }
          }}>
            <SetupForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <Button
            onClick={initializeSetup}
            disabled={isLoading}
            className="w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Setting up..." : "Add Payment Method"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};