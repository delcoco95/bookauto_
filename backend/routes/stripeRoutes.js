const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const PLANS = {
  starter: { priceId: process.env.STRIPE_PRICE_ID_STARTER, amount: 4999, name: 'Starter 49,99€/mois' },
  premium: { priceId: process.env.STRIPE_PRICE_ID_PREMIUM, amount: 7999, name: 'Premium 79,99€/mois' },
};

// POST /api/stripe/create-checkout — create Stripe checkout session
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Plan invalide.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}` });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId || priceId === 'price_xxx_starter' || priceId === 'price_xxx_premium') {
      return res.status(400).json({ message: 'Les prix Stripe ne sont pas encore configurés. Veuillez contacter l\'administrateur.' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: { trial_period_days: 30 },
      success_url: `${process.env.FRONTEND_URL}/dashboard/pro/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/pro/subscription`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement.', error: error.message });
  }
});

// GET /api/stripe/verify-session/:sessionId — verify after redirect
router.get('/verify-session/:sessionId', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const user = await User.findById(req.user.id);
      const plan = session.metadata?.plan || 'starter';
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = plan;
      user.subscriptionId = session.subscription;
      user.subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      return res.json({ success: true, plan });
    }
    // Trial period
    if (session.status === 'complete') {
      return res.json({ success: true });
    }
    res.json({ success: false, status: session.status });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification.', error: error.message });
  }
});

// POST /api/stripe/webhook — Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          const plan = session.metadata?.plan || 'starter';
          await User.findByIdAndUpdate(userId, {
            subscriptionStatus: 'active',
            subscriptionPlan: plan,
            subscriptionId: session.subscription,
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await User.findOneAndUpdate({ subscriptionId: sub.id }, { subscriptionStatus: 'canceled' });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await User.findOneAndUpdate({ stripeCustomerId: invoice.customer }, { subscriptionStatus: 'past_due' });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

// POST /api/stripe/cancel — cancel subscription
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.subscriptionId) return res.status(400).json({ message: 'Aucun abonnement actif.' });

    await stripe.subscriptions.update(user.subscriptionId, { cancel_at_period_end: true });
    res.json({ message: 'Abonnement annulé. Accès maintenu jusqu\'à la fin de la période.' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation.', error: error.message });
  }
});

module.exports = router;
