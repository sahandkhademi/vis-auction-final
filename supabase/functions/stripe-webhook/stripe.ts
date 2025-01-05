import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';

// Initialize Stripe with the secret key and explicit API version
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});