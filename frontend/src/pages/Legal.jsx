const Legal = () => (
  <div className="min-h-screen bg-gray-50 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mentions Légales</h1>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Éditeur</h2>
          <p className="text-gray-700">Bookauto, société par actions simplifiée. Email: support@bookauto.local</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Hébergement</h2>
          <p className="text-gray-700">Hébergeur: Acme Hosting, 123 Rue de Paris, 75000 Paris.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Propriété intellectuelle</h2>
          <p className="text-gray-700">Tous les contenus de ce site sont protégés. Toute reproduction est interdite sans autorisation.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p className="text-gray-700">Pour toute demande, veuillez utiliser la page Contact.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Legal;
