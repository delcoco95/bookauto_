const express = require('express');
const { verifyToken, requirePro, requireClient } = require('../middleware/auth');
const createDepositPaymentIntent = require('../controllers/stripe/createDepositPaymentIntent');
const createProSubscriptionCheckout = require('../controllers/stripe/createProSubscriptionCheckout');
const webhook = require('../controllers/stripe/webhook');

const router = express.Router();

// Webhook endpoint (must be before JSON parsing middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

// Deposit payment for appointments (client only)
router.post('/deposit', verifyToken, requireClient, createDepositPaymentIntent);

// Pro subscription checkout (pro only)
router.post('/subscription/checkout', verifyToken, requirePro, createProSubscriptionCheckout);

// Get subscription status (pro only)
router.get('/subscription/status', verifyToken, requirePro, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionId: user.subscriptionId,
      subscriptionEndsAt: user.subscriptionEndsAt,
      hasActiveSubscription: user.hasActiveSubscription(),
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut' });
  }
});

// Cancel subscription (pro only)
router.post('/subscription/cancel', verifyToken, requirePro, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.subscriptionId) {
      return res.status(400).json({ message: 'Aucun abonnement actif' });
    }

    const stripe = require('../config/stripe');
    const subscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      message: 'Abonnement programmé pour annulation',
      cancelAt: new Date(subscription.cancel_at * 1000),
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation' });
  }
});

module.exports = router;
