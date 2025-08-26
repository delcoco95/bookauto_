import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { 
  getSubscriptionStatus, 
  createProSubscriptionCheckout, 
  cancelSubscription,
  redirectToCheckout,
  getSubscriptionStatusDisplay,
  getSubscriptionStatusColor
} from '../../services/stripe';

const ProSubscription = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    setIsLoading(true);
    const result = await getSubscriptionStatus();
    
    if (result.success) {
      setSubscription(result.data);
    } else {
      showToast('Erreur lors du chargement de l\'abonnement', 'error');
    }
    
    setIsLoading(false);
  };

  const handleSubscribe = async () => {
    setActionLoading(true);
    const result = await createProSubscriptionCheckout();
    
    if (result.success) {
      // Redirect to Stripe checkout
      redirectToCheckout(result.data.url);
    } else {
      showToast(result.error, 'error');
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
      return;
    }

    setActionLoading(true);
    const result = await cancelSubscription();
    
    if (result.success) {
      showToast('Abonnement programmé pour annulation', 'info');
      await loadSubscriptionStatus();
    } else {
      showToast(result.error, 'error');
    }
    
    setActionLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.hasActiveSubscription;
  const status = subscription?.subscriptionStatus;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abonnement professionnel</h1>
          <p className="text-gray-600 mt-2">
            Gérez votre abonnement et accédez à toutes les fonctionnalités pro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Status */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">
                  Statut de l'abonnement
                </h2>
              </div>

              {!hasActiveSubscription ? (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun abonnement actif
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Souscrivez à notre abonnement professionnel pour accéder à toutes 
                    les fonctionnalités et recevoir des réservations.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={actionLoading}
                    className="btn btn-primary"
                  >
                    {actionLoading ? 'Redirection...' : 'S\'abonner maintenant'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Abonnement actif
                        </h3>
                        <p className={`text-sm ${getSubscriptionStatusColor(status)}`}>
                          {getSubscriptionStatusDisplay(status)}
                        </p>
                      </div>
                    </div>
                    {status === 'trialing' && (
                      <span className="badge badge-info">Période d'essai</span>
                    )}
                  </div>

                  {subscription.subscriptionEndsAt && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {status === 'trialing' ? 'Fin de la période d\'essai' : 'Prochaine facturation'} : {' '}
                          <span className="font-medium">
                            {new Date(subscription.subscriptionEndsAt).toLocaleDateString('fr-FR')}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">✓ Création de services illimitée</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">✓ Réception de réservations</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">✓ Gestion du planning</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">✓ Messagerie avec les clients</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">✓ Statistiques détaillées</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {actionLoading ? 'Traitement...' : 'Annuler l\'abonnement'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Abonnement Pro
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">29€</div>
                <div className="text-sm text-gray-600">par mois, TTC</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>30 jours d'essai gratuit</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Annulation à tout moment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Support client inclus</span>
                </div>
              </div>

              {!hasActiveSubscription && (
                <button
                  onClick={handleSubscribe}
                  disabled={actionLoading}
                  className="btn btn-primary w-full mt-6"
                >
                  {actionLoading ? 'Redirection...' : 'Commencer l\'essai'}
                </button>
              )}
            </div>

            {/* Help */}
            <div className="card mt-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Besoin d'aide ?
                  </h4>
                  <p className="text-gray-600">
                    Contactez notre support pour toute question sur votre abonnement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProSubscription;
