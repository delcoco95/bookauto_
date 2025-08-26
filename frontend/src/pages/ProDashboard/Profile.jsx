import React, { useState } from 'react';
import { Building, Mail, Phone, MapPin, Save, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const ProProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessDescription: user?.businessDescription || '',
    companyAddress: {
      street: user?.companyAddress?.street || '',
      city: user?.companyAddress?.city || '',
      zipCode: user?.companyAddress?.zipCode || '',
    },
    categories: user?.categories || [],
    serviceRadius: user?.serviceRadius || 30,
  });

  const categoryOptions = [
    { id: 'auto', name: 'Auto' },
    { id: 'plomberie', name: 'Plomberie' },
    { id: 'serrurerie', name: 'Serrurerie' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('Address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        companyAddress: {
          ...prev.companyAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(cat => cat !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      updateUser(formData);
      setIsEditing(false);
      showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const cancelEdit = () => {
    setFormData({
      companyName: user?.companyName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      businessDescription: user?.businessDescription || '',
      companyAddress: {
        street: user?.companyAddress?.street || '',
        city: user?.companyAddress?.city || '',
        zipCode: user?.companyAddress?.zipCode || '',
      },
      categories: user?.categories || [],
      serviceRadius: user?.serviceRadius || 30,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil professionnel</h1>
          <p className="text-gray-600 mt-2">
            Gérez les informations de votre entreprise et vos paramètres.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="w-32 h-32 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.companyName}
              </h3>
              <p className="text-gray-600">SIRET: {user?.siret}</p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-gray-600">
                  {user?.averageRating || 'N/A'} ({user?.totalReviews || 0} avis)
                </span>
              </div>
              <button className="btn btn-outline mt-4">
                Changer le logo
              </button>
            </div>

            {/* Quick Stats */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Services actifs</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Réservations totales</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux d'acceptation</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Informations de l'entreprise
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Company Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input pl-10"
                    />
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled={true}
                        className="input pl-10 bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de l'entreprise
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="companyAddress.street"
                        value={formData.companyAddress.street}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input pl-10"
                        placeholder="Rue, numéro"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="companyAddress.zipCode"
                        value={formData.companyAddress.zipCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input"
                        placeholder="Code postal"
                      />
                      <input
                        type="text"
                        name="companyAddress.city"
                        value={formData.companyAddress.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input"
                        placeholder="Ville"
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domaines d'activité
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {categoryOptions.map((category) => (
                      <label
                        key={category.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          !isEditing ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          formData.categories.includes(category.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          disabled={!isEditing}
                          className="mr-2"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Service Radius */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon d'intervention: {formData.serviceRadius} km
                  </label>
                  <input
                    type="range"
                    name="serviceRadius"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.serviceRadius}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de l'activité
                  </label>
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className="input"
                    placeholder="Décrivez votre entreprise et vos services..."
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn btn-outline"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProProfile;
