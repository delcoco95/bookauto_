const stripe = require('../../config/stripe');
const User = require('../../models/User');
const Appointment = require('../../models/Appointment');

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle successful payment intent (deposit payment)
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const { appointmentId } = paymentIntent.metadata;

  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.depositPaid = true;
      appointment.depositChargeId = paymentIntent.charges.data[0]?.id;
      await appointment.save();
      
      console.log(`Deposit payment succeeded for appointment ${appointmentId}`);
      
      // TODO: Send confirmation email to client and pro
    }
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  const { appointmentId } = paymentIntent.metadata;
  
  if (appointmentId) {
    console.log(`Deposit payment failed for appointment ${appointmentId}`);
    // TODO: Send failure notification
  }
};

// Handle subscription creation
const handleSubscriptionCreated = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscriptionId = subscription.id;
      user.subscriptionStatus = subscription.status;
      user.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
      await user.save();
      
      console.log(`Subscription created for user ${userId}`);
    }
  }
};

// Handle subscription updates
const handleSubscriptionUpdated = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscriptionStatus = subscription.status;
      user.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
      await user.save();
      
      console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
      
      // If subscription becomes inactive, user loses pro access
      if (!['active', 'trialing'].includes(subscription.status)) {
        console.log(`User ${userId} lost pro access due to subscription status: ${subscription.status}`);
      }
    }
  }
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (subscription) => {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscriptionStatus = 'canceled';
      user.subscriptionId = null;
      await user.save();
      
      console.log(`Subscription deleted for user ${userId}`);
    }
  }
};

// Handle successful invoice payment
const handleInvoicePaymentSucceeded = async (invoice) => {
  // This handles recurring subscription payments
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  await handleSubscriptionUpdated(subscription);
  
  console.log(`Invoice payment succeeded: ${invoice.id}`);
  // TODO: Send receipt email
};

// Handle failed invoice payment
const handleInvoicePaymentFailed = async (invoice) => {
  console.log(`Invoice payment failed: ${invoice.id}`);
  // TODO: Send payment failure notification
};

module.exports = webhook;
