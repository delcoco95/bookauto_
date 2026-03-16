import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, AlertCircle, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

const PLANS = {
  starter: {
    name: 'Starter',
    price: '49,99EUR',
    color: 'blue',
    features: ['Profil complet', '5 services listes', '20 reservations/mois', 'Planning de base', 'Support email'],
  },
  premium: {
    name: 'Premium',
    price: '79,99EUR',
    color: 'yellow',
    features: ['Profil mis en avant', 'Services illimites', 'Reservations illimitees', 'Badge Premium', 'Statistiques avancees', 'Facturation integree', 'Support prioritaire'],
  },
};

const ProSubscription = () => {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest.get('/api/stripe/subscription');
        setSub(res.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const res = await apiRequest.post('/api/stripe/create-checkout', { plan });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert('Erreur: URL de paiement manquante.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la redirection vers le paiement.';
      alert(`❌ ${msg}`);
      console.error('Checkout error:', err.response?.data || err.message);
    }
    setCheckoutLoading(null);
  };

  const handleCancel = async () => {
    if (!confirm(
      'Êtes-vous sûr de vouloir annuler votre abonnement ? ' +
      'Votre accès restera actif jusqu\'à la fin de votre période de facturation.'
    )) return;
    setCancelling(true);
    try {
      const res = await apiRequest.post('/api/stripe/cancel');
      alert(res.data.message || 'Abonnement annulé. Vous conservez votre accès jusqu\'à la fin de la période.');
      window.location.reload();
    } catch { alert("Erreur lors de l'annulation."); }
    setCancelling(false);
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const res = await apiRequest.post('/api/stripe/reactivate');
      if (res.data.requiresNewCheckout) {
        // Subscription expired — go through new checkout
        handleCheckout(currentPlan || 'starter');
        return;
      }
      alert('Abonnement réactivé avec succès !');
      window.location.reload();
    } catch (err) {
      if (err.response?.data?.requiresNewCheckout) {
        handleCheckout(currentPlan || 'starter');
        return;
      }
      alert('Erreur lors de la réactivation.');
    }
    setReactivating(false);
  };

  const isActive = ['active', 'trialing'].includes(sub?.status);
  const currentPlan = user?.subscriptionPlan || sub?.plan;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abonnement professionnel</h1>
          <p className="text-gray-600 mt-2">Gerez votre abonnement et accelez a toutes les fonctionnalites.</p>
        </div>

        {/* Current status */}
        {!loading && sub && (
          <div className={`rounded-xl p-6 mb-8 ${isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {isActive
                  ? <CheckCircle className="w-8 h-8 text-green-600" />
                  : <XCircle className="w-8 h-8 text-red-600" />}
                <div>
                  <h2 className={`text-lg font-bold ${isActive ? 'text-green-800' : 'text-red-800'}`}>
                    {sub.status === 'trialing' ? "Periode d essai gratuite" : isActive ? 'Abonnement actif' : 'Abonnement inactif'}
                    {currentPlan && ` - ${PLANS[currentPlan]?.name || currentPlan}`}
                  </h2>
                  {sub.currentPeriodEnd && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {sub.cancelAtPeriodEnd ? "Acces jusqu au" : 'Renouvellement le'}{' '}
                        {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isActive && !sub.cancelAtPeriodEnd && (
                  <button onClick={handleCancel} disabled={cancelling} className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50 text-sm">
                    {cancelling ? 'Annulation...' : "Annuler l'abonnement"}
                  </button>
                )}
                {isActive && sub.cancelAtPeriodEnd && (
                  <button onClick={handleReactivate} disabled={reactivating} className="btn btn-primary text-sm">
                    {reactivating ? 'Réactivation...' : "Annuler la résiliation"}
                  </button>
                )}
                {!isActive && sub.status === 'canceled' && (
                  <button onClick={() => handleCheckout(currentPlan || 'starter')} disabled={checkoutLoading} className="btn btn-primary text-sm">
                    {checkoutLoading ? 'Chargement...' : 'Souscrire un nouvel abonnement'}
                  </button>
                )}
              </div>
            </div>
            {!isActive && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Votre acces aux fonctionnalites professionnelles est bloque. Souscrivez ou reactivez un abonnement pour continuer.</span>
              </div>
            )}
          </div>
        )}

        {/* Plans */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nos formules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = currentPlan === key && isActive;
            return (
              <div key={key} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${isCurrent ? 'border-primary-500' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {key === 'premium' ? <Crown className="w-5 h-5 text-yellow-500" /> : <Zap className="w-5 h-5 text-blue-500" />}
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  {isCurrent && <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">Actuel</span>}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">/ mois TTC</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={checkoutLoading === key}
                    className={`w-full btn ${key === 'premium' ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-0' : 'btn-primary'}`}
                  >
                    {checkoutLoading === key ? 'Chargement...' : isActive ? `Changer pour ${plan.name}` : `Choisir ${plan.name}`}
                  </button>
                )}
                {isCurrent && (
                  <div className="w-full text-center py-2 text-sm text-gray-500">Formule actuelle</div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">Premier mois offert - sans engagement - resiliable a tout moment depuis ce tableau de bord.</p>
      </div>
    </div>
  );
};

export default ProSubscription;
