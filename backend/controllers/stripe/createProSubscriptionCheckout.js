const stripe = require('../../config/stripe');
const User = require('../../models/User');

const createProSubscriptionCheckout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'pro') {
      return res.status(403).json({ message: 'Accès réservé aux professionnels' });
    }

    if (!process.env.STRIPE_PRICE_ID_PRO) {
      return res.status(500).json({ 
        message: 'Configuration Stripe incomplète (STRIPE_PRICE_ID_PRO manquant)' 
      });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString(),
          companyName: user.companyName,
          siret: user.siret,
        },
      });
      
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
      return res.status(400).json({ 
        message: 'Vous avez déjà un abonnement actif' 
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/pro/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pro/subscription?canceled=true`,
      metadata: {
        userId: user._id.toString(),
        type: 'pro_subscription',
      },
      subscription_data: {
        trial_period_days: 30, // 30 days trial
        metadata: {
          userId: user._id.toString(),
        },
      },
      customer_update: {
        shipping: 'auto',
        address: 'auto',
      },
      billing_address_collection: 'required',
    });

    res.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la session de paiement',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = createProSubscriptionCheckout;
