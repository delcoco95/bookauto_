import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49,99',
    icon: <Zap className="w-6 h-6" />,
    color: 'blue',
    features: [
      'Profil professionnel complet',
      "Jusqu'à 5 services listés",
      'Planning de base',
      '10 réservations / mois',
      'Support par email',
      'Badge vérifié',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '79,99',
    icon: <Crown className="w-6 h-6" />,
    color: 'indigo',
    popular: true,
    features: [
      'Mise en avant dans les résultats',
      'Services illimités',
      'Planning avancé',
      'Réservations illimitées',
      'Statistiques & analytics',
      'Facturation intégrée',
      'Support prioritaire',
      'Badge Premium',
    ],
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos offres professionnelles</h1>
          <p className="text-xl text-gray-500">Premier mois offert — Sans engagement</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-md border-2 ${plan.popular ? 'border-indigo-500' : 'border-gray-100'} p-8 relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                {plan.icon}
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}€</span>
                <span className="text-gray-500 ml-1">/ mois</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-gray-700">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.color === 'indigo' ? 'text-indigo-500' : 'text-blue-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register/pro"
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Commencer gratuitement
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-10 text-sm">
          Tous les plans incluent un essai gratuit de 30 jours. Annulation possible à tout moment depuis votre dashboard.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
