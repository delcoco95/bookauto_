import React, { useState } from 'react';
import { User, Mail, Phone, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      showToast('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    try {
      // Simulation d'update - à remplacer par vraie API
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      updateUser(updateData);
      setIsEditing(false);
      showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et paramètres de compte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600">Client Bookauto</p>
              <button className="btn btn-outline mt-4">
                Changer la photo
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Informations personnelles
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
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

                  {/* Last Name */}
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

                  {/* Email */}
                  <div className="md:col-span-2">
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
                    <p className="text-sm text-gray-500 mt-1">
                      L'email ne peut pas être modifié. Contactez le support si nécessaire.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
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
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                {isEditing && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Changer le mot de passe (optionnel)
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="input pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="input"
                          placeholder="Minimum 6 caractères"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-8 flex justify-end space-x-4">
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

export default ClientProfile;
