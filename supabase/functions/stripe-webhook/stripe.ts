import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  // This is optional but recommended for better type information
  apiVersion: '2023-10-16',
  // Needed for Deno environment
  httpClient: Stripe.createFetchHttpClient(),
});