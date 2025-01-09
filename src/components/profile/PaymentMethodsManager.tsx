import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

// Get the Stripe key from environment variables
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe Key Status:', stripeKey ? 'Found' : 'Missing');

// Initialize Stripe only if we have a valid key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const PaymentMethodForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const setupPaymentMethod = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add a payment method");
      return;
    }

    if (!stripe || !elements) {
      toast.error("Stripe has not been initialized");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-payment-method');
      
      if (error) throw error;

      const { error: setupError } = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: session.user.email,
          },
        },
      });

      if (setupError) {
        throw setupError;
      }

      toast.success("Payment method added successfully");
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast.error("Failed to set up payment method");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardElement />
      <Button
        onClick={setupPaymentMethod}
        disabled={isLoading || !stripe || !elements}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </>
        )}
      </Button>
    </div>
  );
};

export const PaymentMethodsManager = () => {
  const session = useSession();
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

  if (!stripeKey) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Missing</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            The Stripe publishable key is not configured. This is required for payment processing.
          </p>
          <p className="text-sm">
            Please contact support or check the documentation for setup instructions.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Stripe Keys
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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

        {stripePromise && (
          <Elements stripe={stripePromise}>
            <PaymentMethodForm />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
};