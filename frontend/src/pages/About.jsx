import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, Users, TrendingUp, CheckCircle, Car, Wrench, Lock, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '50+', label: 'Professionnels vérifiés' },
  { value: '100+', label: 'Clients satisfaits' },
  { value: '98%', label: 'Taux de satisfaction' },
  { value: '24h', label: 'Délai moyen de prise en charge' },
];

const STEPS = [
  { icon: '🔍', title: 'Recherchez', desc: 'Trouvez le professionnel idéal près de chez vous selon vos besoins.' },
  { icon: '📅', title: 'Réservez', desc: 'Choisissez un créneau disponible et confirmez votre rendez-vous en ligne.' },
  { icon: '✅', title: 'Profitez', desc: 'Le professionnel intervient. Évaluez sa prestation et laissez un avis.' },
];

const VALUES = [
  { icon: Shield, title: 'Fiabilité', desc: 'Tous nos professionnels sont vérifiés (SIRET, assurances, qualifications).' },
  { icon: Star, title: 'Qualité', desc: 'Les avis clients authentiques garantissent un niveau de service élevé.' },
  { icon: Users, title: 'Accessibilité', desc: 'Une plateforme simple et intuitive, pensée pour tous les utilisateurs.' },
  { icon: TrendingUp, title: 'Croissance', desc: 'Nous aidons les professionnels à développer leur activité.' },
];

const DOMAINS = [
  { icon: Car, label: 'Automobile', desc: 'Réparation, entretien, dépannage, carrosserie…', color: 'bg-blue-50 text-blue-600' },
  { icon: Wrench, label: 'Plomberie', desc: 'Fuites, installations, rénovations, urgences…', color: 'bg-green-50 text-green-600' },
  { icon: Lock, label: 'Serrurerie', desc: 'Ouverture, installation, blindage, sécurité…', color: 'bg-purple-50 text-purple-600' },
];

const About = () => (
  <div className="min-h-screen bg-white">
    {/* Hero */}
    <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <CheckCircle className="w-4 h-4" /> Plateforme de confiance
        </div>
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          La mise en relation simplifiée entre clients et professionnels
        </h1>
        <p className="text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
          BookAuto connecte des milliers de clients à des professionnels certifiés dans l'automobile, la plomberie et la serrurerie — rapidement, simplement, en toute confiance.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link to="/search" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition flex items-center gap-2">
            Trouver un pro <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/register/pro" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition">
            Rejoindre comme professionnel
          </Link>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="bg-gray-50 py-14 border-b">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-extrabold text-primary-600 mb-1">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Mission */}
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre mission</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Nous avons créé BookAuto pour répondre à un constat simple : trouver un professionnel fiable prend trop de temps. Notre mission est de rendre la recherche et la réservation d'un professionnel aussi simple que possible, tout en offrant aux artisans et techniciens les outils pour gérer leur activité efficacement.
        </p>
      </div>
    </section>

    {/* Domains */}
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos domaines d'intervention</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOMAINS.map((d) => (
            <div key={d.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center mb-4`}>
                <d.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{d.label}</h3>
              <p className="text-gray-500 text-sm">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">{i + 1}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-primary-700 text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Nos valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="flex gap-4 bg-white/10 rounded-2xl p-6 backdrop-blur">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <v.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{v.title}</h3>
                <p className="text-primary-100 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-4 bg-white text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à commencer ?</h2>
      <p className="text-gray-500 mb-8">Rejoignez notre communauté de professionnels et de clients satisfaits.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/search" className="btn btn-primary px-8 py-3 text-base">Trouver un professionnel</Link>
        <Link to="/contact" className="btn btn-outline px-8 py-3 text-base">Nous contacter</Link>
      </div>
    </section>
  </div>
);

export default About;
