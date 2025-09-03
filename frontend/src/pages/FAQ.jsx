const FAQ = () => (
  <div className="min-h-screen bg-gray-50 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Questions Fréquentes
        </h1>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Réservations</h2>
          <div className="mt-4 space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium">Comment réserver un service ?</h3>
              <p>
                Recherchez un professionnel, choisissez un service et proposez
                un créneau. Vous recevrez une confirmation par email.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Puis-je annuler une réservation ?</h3>
              <p>
                Oui, depuis votre tableau de bord. Les annulations tardives
                peuvent entraîner des frais selon les conditions du pro.
              </p>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Comptes</h2>
          <div className="mt-4 space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium">Comment créer un compte pro ?</h3>
              <p>
                Inscrivez-vous via la page dédiée aux professionnels et
                complétez vos informations d’entreprise.
              </p>
            </div>
            <div>
              <h3 className="font-medium">J’ai oublié mon mot de passe</h3>
              <p>
                Utilisez la page « Mot de passe oublié » pour recevoir un lien
                de réinitialisation.
              </p>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Support</h2>
          <p className="mt-4 text-gray-700">
            Contactez-nous via la page Contact pour toute question.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default FAQ;
