import { apiRequest, handleApiError } from './api';

// Create payment intent for appointment deposit
export const createDepositPaymentIntent = async (appointmentId) => {
  try {
    const response = await apiRequest.post('/api/stripe/deposit', {
      appointmentId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Create pro subscription checkout session
export const createProSubscriptionCheckout = async () => {
  try {
    const response = await apiRequest.post('/api/stripe/subscription/checkout');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Get subscription status
export const getSubscriptionStatus = async () => {
  try {
    const response = await apiRequest.get('/api/stripe/subscription/status');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Cancel subscription
export const cancelSubscription = async () => {
  try {
    const response = await apiRequest.post('/api/stripe/subscription/cancel');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Redirect to Stripe checkout
export const redirectToCheckout = (checkoutUrl) => {
  window.location.href = checkoutUrl;
};

// Format currency for display
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Calculate deposit amount (20%)
export const calculateDepositAmount = (totalPrice) => {
  return Math.round(totalPrice * 0.20 * 100) / 100;
};

// Calculate cancellation fee (15% of service price)
export const calculateCancellationFee = (servicePrice, hoursUntilAppointment) => {
  if (hoursUntilAppointment >= 24) {
    return 0; // No fee for cancellations 24h+ in advance
  }
  return Math.round(servicePrice * 0.15 * 100) / 100;
};

// Payment status helpers
export const getPaymentStatusDisplay = (status) => {
  const statusMap = {
    requires_payment_method: 'En attente de paiement',
    requires_confirmation: 'Confirmation requise',
    requires_action: 'Action requise',
    processing: 'En cours de traitement',
    succeeded: 'Paiement réussi',
    canceled: 'Annulé',
    requires_capture: 'En attente de capture',
  };
  
  return statusMap[status] || status;
};

// Subscription status helpers
export const getSubscriptionStatusDisplay = (status) => {
  const statusMap = {
    incomplete: 'Incomplet',
    incomplete_expired: 'Expiré',
    trialing: 'Période d\'essai',
    active: 'Actif',
    past_due: 'Impayé',
    canceled: 'Annulé',
    unpaid: 'Non payé',
  };
  
  return statusMap[status] || status;
};

export const getSubscriptionStatusColor = (status) => {
  const colorMap = {
    trialing: 'text-blue-600',
    active: 'text-green-600',
    past_due: 'text-yellow-600',
    canceled: 'text-red-600',
    unpaid: 'text-red-600',
    incomplete: 'text-gray-600',
    incomplete_expired: 'text-red-600',
  };
  
  return colorMap[status] || 'text-gray-600';
};
