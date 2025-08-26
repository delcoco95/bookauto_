import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, Wrench, Key, Star, Shield, Clock } from 'lucide-react';

const Home = () => {
  const categories = [
    {
      id: 'auto',
      name: 'Auto',
      icon: Car,
      description: 'Réparation, entretien, dépannage auto',
      color: 'bg-blue-500',
    },
    {
      id: 'plomberie',
      name: 'Plomberie',
      icon: Wrench,
      description: 'Dépannage, installation, rénovation',
      color: 'bg-green-500',
    },
    {
      id: 'serrurerie',
      name: 'Serrurerie',
      description: 'Ouverture de porte, installation, sécurité',
      icon: Key,
      color: 'bg-yellow-500',
    },
  ];

  const features = [
    {
      icon: Search,
      title: 'Trouvez facilement',
      description: 'Recherchez par localisation et type de service',
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis clients authentiques',
    },
    {
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Acompte en ligne, paiement protégé',
    },
    {
      icon: Clock,
      title: 'Réservation rapide',
      description: 'Réservez en quelques clics',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouvez le bon professionnel,
              <br />
              <span className="text-primary-200">près de chez vous</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Réservez rapidement vos services d'auto, plomberie et serrurerie.
              Avis vérifiés, paiement sécurisé, intervention garantie.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Rechercher un service
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-lg text-gray-600">
              Trouvez le professionnel qu'il vous faut
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/search?category=${category.id}`}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  <div className="text-center">
                    <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Bookauto ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes un professionnel ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez notre plateforme et développez votre activité.
            Recevez des demandes qualifiées et gérez vos rendez-vous facilement.
          </p>
          <Link
            to="/register/pro"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Devenir professionnel
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
