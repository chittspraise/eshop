// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'npm:stripe@^17.5.0';
import { getOrCreateStripeCustomerForSupabaseUser } from "../supabase";

 export const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  const { totalAmount } = await req.json()

  const customer = await getOrCreateStripeCustomerForSupabaseUser(req)
 
  const ephmeralKey = await stripe.ephemeralKeys.create(
    {customer: customer},
    {apiVersion: '2020-08-27'}
  )
  const payementIntent= await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'usd',
    customer: customer, // links paymemt intent to customer
  })
  const response = {
   paymentIntent: payementIntent.client_secret,
   publicKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
   ephmeralKey: ephmeralKey.secret,
   customer
  }

  return new Response(
    JSON.stringify(response),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-checkout' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/