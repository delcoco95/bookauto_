import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              À propos de Bookauto
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme moderne pour connecter particuliers et professionnels 
              dans les domaines de l'auto, de la plomberie et de la serrurerie.
            </p>
          </div>

          {/* Story */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre histoire</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Bookauto est né de l'intuition d'<strong>Hedi</strong> : fluidifier la rencontre 
              entre particuliers et professionnels de l'auto, de la plomberie et de la serrurerie, 
              y compris en urgence. Porté par l'expertise web et IT de <strong>Nedj</strong>, 
              le projet s'est concrétisé en une plateforme fiable, moderne et accessible.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Notre mission : aider les pros à développer leur activité, et permettre aux 
              particuliers de trouver rapidement le bon service, sans se déplacer inutilement.
            </p>
          </div>

          {/* Team */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">L'équipe fondatrice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nedj */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">N</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Nedj Belloum</h3>
                <p className="text-primary-600 text-center font-medium mb-4">
                  Co-fondateur & Créateur
                </p>
                <p className="text-gray-600 text-center">
                  Expert en développement web et IT, Nedj apporte son expertise technique 
                  pour créer une plateforme robuste et performante.
                </p>
              </div>

              {/* Hedi */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="w-20 h-20 bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">H</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Hedi</h3>
                <p className="text-secondary-600 text-center font-medium mb-4">
                  Fondateur, Marketing & Acquisition
                </p>
                <p className="text-gray-600 text-center">
                  Visionnaire du projet, Hedi se concentre sur l'idéation, 
                  la stratégie marketing et l'acquisition de nouveaux utilisateurs.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Fiabilité</h3>
                <p className="text-gray-600 text-sm">
                  Des professionnels vérifiés et des avis authentiques
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Rapidité</h3>
                <p className="text-gray-600 text-sm">
                  Trouvez et réservez un service en quelques clics
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">🛡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sécurité</h3>
                <p className="text-gray-600 text-sm">
                  Paiements sécurisés et protection des données
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center bg-primary-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Une question ? Un projet ?
            </h2>
            <p className="text-gray-600 mb-6">
              N'hésitez pas à nous contacter, nous serons ravis d'échanger avec vous.
            </p>
            <a
              href="/contact"
              className="btn btn-primary"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
