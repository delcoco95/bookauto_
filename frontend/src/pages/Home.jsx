import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, Wrench, Key, Zap, Star, Shield, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const categories = [
    {
      id: 'auto',
      name: 'Automobile',
      icon: Car,
      description: 'Réparation, entretien, dépannage auto',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'plomberie',
      name: 'Plomberie',
      icon: Wrench,
      description: 'Dépannage, installation, rénovation',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      id: 'serrurerie',
      name: 'Serrurerie',
      description: 'Ouverture de porte, installation, sécurité',
      icon: Key,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      id: 'electricite',
      name: 'Électricité',
      description: 'Dépannage, installation, mise aux normes',
      icon: Zap,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const features = [
    {
      icon: Search,
      title: 'Trouvez facilement',
      description: 'Recherchez par localisation et type de service. Des pros vérifiés près de chez vous.',
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis clients authentiques pour choisir le meilleur professionnel.',
    },
    {
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Acompte en ligne sécurisé via Stripe. Paiement protégé à chaque étape.',
    },
    {
      icon: Clock,
      title: 'Réservation rapide',
      description: 'Réservez en quelques clics, recevez une confirmation par email et SMS.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Professionnels' },
    { value: '10 000+', label: 'Réservations' },
    { value: '4.8/5', label: 'Note moyenne' },
    { value: '98%', label: 'Clients satisfaits' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              ✨ La plateforme #1 des artisans
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Trouvez le bon professionnel,
              <br />
              <span className="text-yellow-300">près de chez vous</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Auto, plomberie, serrurerie, électricité — réservez rapidement.
              Avis vérifiés, paiement sécurisé, intervention garantie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Trouver un artisan
              </Link>
              <Link
                to="/register/pro"
                className="inline-flex items-center justify-center border-2 border-white/70 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all"
              >
                Devenir professionnel
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary-600">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Des professionnels qualifiés et vérifiés dans chaque domaine
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/search?category=${category.id}`}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group border border-transparent hover:border-gray-100"
                >
                  <div className={`${category.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{category.description}</p>
                  <div className={`mt-4 text-sm font-medium ${category.textColor} flex items-center`}>
                    Rechercher <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Bookauto ?
            </h2>
            <p className="text-lg text-gray-500">Simple, rapide, sécurisé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Ils nous font confiance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Intervention rapide, pro sérieux. Je recommande à 100% !", author: "Marie L." },
              { text: "Service impeccable, prise de RDV en 2 minutes. Très pratique.", author: "Thomas R." },
              { text: "Professionnel compétent, tarif transparent. Parfait !", author: "Isabelle M." },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-left">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-3">"{review.text}"</p>
                <p className="text-gray-900 font-medium text-sm">{review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vous êtes un professionnel ?
          </h2>
          <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
            Rejoignez notre plateforme. <strong>1 mois offert</strong> à l'inscription.
            Recevez des demandes qualifiées et gérez vos rendez-vous facilement.
          </p>
          <ul className="flex flex-col sm:flex-row justify-center gap-3 mb-8 text-primary-100">
            {['Visibilité immédiate', 'SIRET vérifié', 'Paiements sécurisés'].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-300" /> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register/pro"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
