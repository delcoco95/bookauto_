import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { useUI } from '../context/UIContext';
import { Send, CheckCircle, ChevronDown } from 'lucide-react';

const SUBJECTS = [
  'Question générale',
  'Problème technique',
  'Signaler un professionnel',
  'Devenir professionnel partenaire',
  'Facturation / paiement',
  'Suppression de compte',
  'Autre',
];

const Contact = () => {
  const { showToast } = useUI();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest.post('/api/contact', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      showToast('L\'envoi a échoué. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Support</span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">Contactez-nous</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Une question, un problème ou une suggestion ? Notre équipe vous répond sous 24 h.
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h2>
            <p className="text-gray-500 mb-6">
              Merci de nous avoir contactés. Notre équipe vous répondra dans les meilleurs délais.
            </p>
            <button onClick={() => setSent(false)} className="btn btn-outline text-sm">
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Envoyer un message</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                  <input className="input" name="name" value={form.name} onChange={onChange}
                    placeholder="Jean Dupont" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
                  <input className="input" type="email" name="email" value={form.email}
                    onChange={onChange} placeholder="jean@exemple.fr" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet *</label>
                <div className="relative">
                  <select name="subject" value={form.subject} onChange={onChange}
                    className="input appearance-none pr-9" required>
                    <option value="">Choisissez un sujet…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea className="input resize-none" rows={5} name="message" value={form.message}
                  onChange={onChange} placeholder="Décrivez votre demande en détail…" required />
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours…</>
                ) : (
                  <><Send className="w-4 h-4" /> Envoyer le message</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Pro CTA below form */}
        <div className="mt-6 bg-gradient-to-br from-primary-600 to-blue-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Vous êtes professionnel ?</h3>
            <p className="text-white/80 text-sm mt-1">
              Rejoignez notre réseau de partenaires vérifiés et développez votre clientèle.
            </p>
          </div>
          <a href="/register/pro"
            className="flex-shrink-0 bg-white text-primary-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
            Devenir partenaire →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
