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
  const [siretValid, setSiretValid] = useState(null);
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
    if (form.siret.length !== 14) return showToast('SIRET invalide', 'error');
    setChecking(true);
    const res = await verifySiret(form.siret);
    setChecking(false);
    if (res.success) {
      setSiretValid(true);
      if (res.data.companyInfo?.companyName)
        setForm({ ...form, companyName: res.data.companyInfo.companyName });
      showToast('SIRET validé', 'success');
    } else {
      setSiretValid(false);
      showToast(res.error || 'SIRET invalide', 'error');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return showToast('Mots de passe différents', 'error');
    const res = await register(form);
    if (res.success) {
      navigate('/pro/subscription');
    } else {
      showToast(res.error || "Erreur d'inscription", 'error');
    }
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
              {siretValid && (
                <div className="mt-2 text-sm text-green-700 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> SIRET validé
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
            <button type="submit" className="btn btn-primary">
              Créer mon compte pro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthRegisterPro;
