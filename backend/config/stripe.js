const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment features disabled.');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured. Webhooks disabled.');
}

if (!process.env.STRIPE_PRICE_ID_PRO) {
  console.warn('⚠️  STRIPE_PRICE_ID_PRO not configured. Pro subscriptions disabled.');
}

module.exports = stripe;
