import React from 'react';
import { CheckCircle, Calendar, AlertCircle } from 'lucide-react';

const ProSubscription = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abonnement professionnel</h1>
          <p className="text-gray-600 mt-2">
            Votre accès professionnel est inclus et actif. Aucune action n'est requise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">
                  Statut de l'abonnement
                </h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Abonnement actif
                      </h3>
                      <p className="text-sm text-green-600">Accès complet aux fonctionnalités pro</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Renouvellement: automatique
                    </span>
                  </div>
                </div>

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
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Abonnement Pro
              </h3>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">Inclus</div>
                <div className="text-sm text-gray-600">sans frais</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Accès immédiat</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Support client inclus</span>
                </div>
              </div>
            </div>

            <div className="card mt-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Besoin d'aide ?
                  </h4>
                  <p className="text-gray-600">
                    Contactez notre support pour toute question.
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
