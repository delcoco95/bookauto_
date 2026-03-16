import React, { useState, useRef } from 'react';
import { Building, Mail, Phone, MapPin, Save, User, Upload, Camera, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { apiRequest } from '../../services/api';

const ProProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoRef = useRef();

  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    businessDescription: user?.businessDescription || '',
    companyAddress: {
      street: user?.companyAddress?.street || '',
      city: user?.companyAddress?.city || '',
      zipCode: user?.companyAddress?.zipCode || '',
    },
    serviceRadius: user?.serviceRadius || 30,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('Address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        companyAddress: { ...prev.companyAddress, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Le fichier est trop volumineux (max 5 MB)', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest.put('/api/users/me', formData);
      updateUser(res.data);
      setIsEditing(false);
      showToast('Profil mis à jour avec succès', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      companyName: user?.companyName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      businessDescription: user?.businessDescription || '',
      companyAddress: {
        street: user?.companyAddress?.street || '',
        city: user?.companyAddress?.city || '',
        zipCode: user?.companyAddress?.zipCode || '',
      },
      serviceRadius: user?.serviceRadius || 30,
    });
    setLogoPreview(null);
    setIsEditing(false);
  };

  const categoryLabels = { auto: 'Automobile', plomberie: 'Plomberie', serrurerie: 'Serrurerie', electricite: 'Électricité' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil professionnel</h1>
          <p className="text-gray-600 mt-2">Gérez les informations de votre entreprise visibles par vos clients.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center mx-auto border-2 border-gray-200">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-14 h-14 text-primary-400" />
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-1.5 rounded-full shadow hover:bg-primary-700 transition"
                    title="Changer le logo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <h3 className="text-base font-bold text-gray-900">{user?.companyName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {user?.categories?.map(c => categoryLabels[c] || c).join(', ')}
              </p>
              {user?.isSiretVerified && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                  ✓ SIRET vérifié
                </span>
              )}
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-sm text-gray-600">
                  {user?.averageRating?.toFixed(1) || 'N/A'} ({user?.totalReviews || 0} avis)
                </span>
              </div>
            </div>

            {/* SIRET (read-only) */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Numéro SIRET</h3>
              </div>
              <p className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user?.siret || 'Non renseigné'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Le SIRET ne peut pas être modifié après l'inscription.
              </p>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Statistiques rapides</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Abonnement</span>
                  <span className={`font-semibold capitalize ${['trialing','active'].includes(user?.subscriptionStatus) ? 'text-emerald-600' : 'text-red-500'}`}>
                    {user?.subscriptionStatus === 'trialing' ? 'Essai' : user?.subscriptionStatus === 'active' ? 'Actif' : user?.subscriptionStatus || 'Inactif'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium capitalize">{user?.subscriptionPlan || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Informations de l'entreprise</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline text-sm">
                    Modifier
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" name="companyName" value={formData.companyName}
                      onChange={handleChange} disabled={!isEditing} className="input pl-9" />
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" name="firstName" value={formData.firstName}
                        onChange={handleChange} disabled={!isEditing} className="input pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input type="text" name="lastName" value={formData.lastName}
                      onChange={handleChange} disabled={!isEditing} className="input" />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="email" value={user?.email || ''} disabled className="input pl-9 bg-gray-50 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={handleChange} disabled={!isEditing} className="input pl-9"
                        placeholder="0600000000" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />Adresse de l'entreprise
                  </label>
                  <div className="space-y-2">
                    <input type="text" name="companyAddress.street" value={formData.companyAddress.street}
                      onChange={handleChange} disabled={!isEditing} className="input"
                      placeholder="Numéro et rue" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="companyAddress.zipCode" value={formData.companyAddress.zipCode}
                        onChange={handleChange} disabled={!isEditing} className="input" placeholder="Code postal" />
                      <input type="text" name="companyAddress.city" value={formData.companyAddress.city}
                        onChange={handleChange} disabled={!isEditing} className="input" placeholder="Ville" />
                    </div>
                  </div>
                </div>

                {/* Service radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rayon d'intervention : <span className="font-bold text-primary-600">{formData.serviceRadius} km</span>
                  </label>
                  <input type="range" name="serviceRadius" min="5" max="100" step="5"
                    value={formData.serviceRadius} onChange={handleChange} disabled={!isEditing}
                    className="w-full accent-primary-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 km</span><span>100 km</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description de l'activité</label>
                  <textarea name="businessDescription" value={formData.businessDescription}
                    onChange={handleChange} disabled={!isEditing} rows={4} className="input resize-none"
                    placeholder="Décrivez votre expertise, votre expérience et vos services…" />
                </div>

                {/* Actions */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={cancelEdit} className="btn btn-outline" disabled={saving}>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Sauvegarde…</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" />Enregistrer</>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Domains display */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Domaines d'activité</h3>
              <div className="flex flex-wrap gap-2">
                {(user?.categories || []).map(c => (
                  <span key={c} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {categoryLabels[c] || c}
                  </span>
                ))}
                {(!user?.categories || user.categories.length === 0) && (
                  <span className="text-sm text-gray-400">Aucun domaine défini</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Les domaines d'activité sont définis lors de l'inscription et ne peuvent pas être modifiés ici. Contactez le support pour toute modification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProProfile;
