import Stripe from "stripe";

let stripeInstance = null;

export const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "your_stripe_secret_key" || key.startsWith("sk_test_placeholder")) {
      return null;
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
};

export default getStripe;
