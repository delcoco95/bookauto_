import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SubscriptionSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Abonnement activé !</h1>
        <p className="text-gray-600 mb-8">
          Votre abonnement est maintenant actif. Vous avez accès à toutes les fonctionnalités de la plateforme.
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
