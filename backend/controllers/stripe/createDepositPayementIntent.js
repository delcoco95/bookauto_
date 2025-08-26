const stripe = require('../../config/stripe');
const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');

const createDepositPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user._id;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('serviceId')
      .populate('clientId')
      .populate('proId');

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Verify the user is the client
    if (appointment.clientId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Check if appointment is still pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Ce rendez-vous ne peut plus être payé' 
      });
    }

    // Check if payment intent already exists
    if (appointment.depositPaymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(
        appointment.depositPaymentIntentId
      );
      
      if (existingIntent.status === 'succeeded') {
        return res.status(400).json({ 
          message: 'Le dépôt a déjà été payé' 
        });
      }
      
      // Return existing intent if still valid
      if (['requires_payment_method', 'requires_confirmation'].includes(existingIntent.status)) {
        return res.json({
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        });
      }
    }

    // Calculate deposit amount (20% of final price)
    const depositAmount = Math.round(appointment.finalPrice * 0.20 * 100); // in cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'eur',
      customer: appointment.clientId.stripeCustomerId || undefined,
      metadata: {
        appointmentId: appointment._id.toString(),
        clientId: appointment.clientId._id.toString(),
        proId: appointment.proId._id.toString(),
        serviceId: appointment.serviceId._id.toString(),
        type: 'deposit',
      },
      description: `Acompte pour ${appointment.serviceId.name} - ${appointment.proId.companyName}`,
      setup_future_usage: 'off_session',
    });

    // Update appointment with payment intent ID
    appointment.depositPaymentIntentId = paymentIntent.id;
    await appointment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: depositAmount,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du paiement',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = createDepositPaymentIntent;
