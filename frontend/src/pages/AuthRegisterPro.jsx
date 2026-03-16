import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { verifySiret } from '../services/pro';

const AuthRegisterPro = () => {
  const { register } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [siretValid, setSiretValid] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'pro',
    companyName: '',
    siret: '',
    companyAddress: { street: '', city: '', zipCode: '' },
    categories: [],
  });

  const setField = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('companyAddress.')) {
      const key = name.split('.')[1];
      setForm({
        ...form,
        companyAddress: { ...form.companyAddress, [key]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
    // Auto-verify SIRET when 14 digits are entered
    if (name === 'siret' && value.replace(/\s/g, '').length === 14) {
      triggerSiretCheck(value.replace(/\s/g, ''));
    } else if (name === 'siret') {
      setSiretValid(null);
    }
  };

  const triggerSiretCheck = async (siretValue) => {
    setChecking(true);
    const res = await verifySiret(siretValue);
    setChecking(false);
    if (res.success) {
      setSiretValid(true);
      if (res.data.companyInfo?.companyName)
        setForm(prev => ({ ...prev, companyName: res.data.companyInfo.companyName }));
    } else {
      setSiretValid(false);
    }
  };

  const toggleCat = (id) => {
    setForm({
      ...form,
      categories: form.categories.includes(id)
        ? form.categories.filter((c) => c !== id)
        : [...form.categories, id],
    });
  };

  const checkSiret = async () => {
    const clean = form.siret.replace(/\D/g, '');
    if (clean.length !== 14) return showToast('SIRET doit contenir 14 chiffres', 'error');
    setChecking(true);
    const res = await verifySiret(clean);
    setChecking(false);
    if (res.success) {
      setSiretValid(true);
      if (res.data.companyInfo?.companyName)
        setForm(prev => ({ ...prev, companyName: res.data.companyInfo.companyName }));
      showToast('SIRET validé', 'success');
    } else {
      setSiretValid(false);
      showToast(res.error || 'SIRET invalide', 'error');
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (form.password !== form.confirmPassword)
      return showToast('Les mots de passe ne correspondent pas', 'error');
    if (form.categories.length === 0)
      return showToast("Veuillez sélectionner au moins un domaine d'activité", 'error');
    setSubmitting(true);
    try {
      const payload = { ...form, siret: form.siret.replace(/\D/g, '') };
      delete payload.confirmPassword;
      const res = await register(payload);
      if (res.success) {
        showToast('Compte créé ! Choisissez votre abonnement.', 'success');
        navigate('/pro/dashboard/subscription');
      } else {
        if (res.errors && Array.isArray(res.errors)) {
          const errs = {};
          res.errors.forEach(err => { errs[err.path || err.param] = err.msg; });
          setFieldErrors(errs);
          showToast('Veuillez corriger les erreurs ci-dessous', 'error');
        } else {
          showToast(res.error || "Erreur d'inscription", 'error');
        }
      }
    } catch (err) {
      showToast("Une erreur inattendue s'est produite", 'error');
      console.error('Register submit error:', err);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Inscription professionnelle</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Prénom</label>
              <input
                className="input"
                name="firstName"
                value={form.firstName}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Nom</label>
              <input
                className="input"
                name="lastName"
                value={form.lastName}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Téléphone</label>
              <input
                className="input"
                name="phone"
                value={form.phone}
                onChange={setField}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Mot de passe</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirmer</label>
              <input
                className="input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={setField}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">SIRET</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  name="siret"
                  value={form.siret}
                  onChange={setField}
                  required
                />
                <button
                  type="button"
                  onClick={checkSiret}
                  className="btn btn-outline"
                  disabled={checking}
                >
                  {checking ? 'Vérif...' : 'Vérifier'}
                </button>
              </div>
              {siretValid === true && (
                <div className="mt-2 text-sm text-green-700 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> SIRET validé ✓
                </div>
              )}
              {siretValid === false && (
                <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  ✗ SIRET invalide ou non reconnu
                </div>
              )}
              {checking && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" />
                  Vérification en cours...
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Raison sociale</label>
              <input
                className="input"
                name="companyName"
                value={form.companyName}
                onChange={setField}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Rue</label>
              <input
                className="input"
                name="companyAddress.street"
                value={form.companyAddress.street}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Code postal</label>
              <input
                className="input"
                name="companyAddress.zipCode"
                value={form.companyAddress.zipCode}
                onChange={setField}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Ville</label>
              <input
                className="input"
                name="companyAddress.city"
                value={form.companyAddress.city}
                onChange={setField}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Domaines</label>
            <div className="grid grid-cols-3 gap-3">
              {['auto', 'plomberie', 'serrurerie'].map((id) => (
                <label
                  key={id}
                  className={`p-2 border rounded ${form.categories.includes(id) ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={form.categories.includes(id)}
                    onChange={() => toggleCat(id)}
                  />
                  {id}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/register" className="text-sm text-primary-600">
              Créer un compte client
            </Link>
            <button type="submit" disabled={submitting} className="btn btn-primary min-w-40">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Création en cours...
                </span>
              ) : 'Créer mon compte pro'}
            </button>
          </div>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">Erreurs à corriger :</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(fieldErrors).map(([field, msg]) => (
                  <li key={field} className="text-sm text-red-700">{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthRegisterPro;
