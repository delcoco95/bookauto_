import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      apiRequest.get(`/api/stripe/verify-session/${sessionId}`)
        .then(() => refreshUser())
        .catch(() => {})
        .finally(() => setVerified(true));
    } else {
      setVerified(true);
    }
  }, []);

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Abonnement activé !</h1>
        <p className="text-gray-600 mb-8">
          Votre abonnement est maintenant actif. Vous bénéficiez d'un premier mois offert.
          Vous avez accès à toutes les fonctionnalités de la plateforme.
        </p>
        <Link
          to="/pro/dashboard"
          className="inline-block w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Accéder à mon dashboard
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
