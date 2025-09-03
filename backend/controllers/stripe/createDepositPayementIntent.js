require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

module.exports = async function createDepositPaymentIntent(req, res) {
  try {
    // Ex: { amount: 50, currency: 'eur' }
    const { amount, currency = 'eur', metadata = {} } = req.body || {};
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount requis (en euros, nombre > 0)' });
    }
    const amountInCents = Math.round(Number(amount) * 100);

    const pi = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.status(201).json({
      clientSecret: pi.client_secret,
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
    });
  } catch (err) {
    console.error('Stripe error:', err?.message || err);
    return res.status(500).json({ message: 'Stripe error', error: err?.message || String(err) });
  }
};
