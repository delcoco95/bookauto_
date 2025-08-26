import React, { useState } from 'react';
import { Plus, Edit, Trash, Eye, EyeOff, Save, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const ProServices = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Réparation moteur',
      category: 'auto',
      subCategory: 'Réparation',
      description: 'Diagnostic et réparation de tous problèmes moteur',
      durationMinutes: 120,
      priceTTC: 150,
      isActive: true,
      isEmergency: false,
      requiresDisplacement: true,
    },
    {
      id: 2,
      name: 'Vidange complète',
      category: 'auto',
      subCategory: 'Entretien',
      description: 'Vidange huile moteur + changement filtre',
      durationMinutes: 45,
      priceTTC: 80,
      isActive: true,
      isEmergency: false,
      requiresDisplacement: false,
    },
  ]);

  const [editingService, setEditingService] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { showToast } = useUI();

  const categoryOptions = {
    auto: ['Réparation', 'Entretien', 'Dépannage'],
    plomberie: ['Dépannage', 'Installation', 'Rénovation'],
    serrurerie: ['Ouverture de porte', 'Installation', 'Sécurité'],
  };

  const defaultService = {
    name: '',
    category: 'auto',
    subCategory: '',
    description: '',
    durationMinutes: 60,
    priceTTC: 0,
    isActive: true,
    isEmergency: false,
    requiresDisplacement: true,
  };

  const [formData, setFormData] = useState(defaultService);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               (name === 'durationMinutes' || name === 'priceTTC') ? 
               parseFloat(value) || 0 : value,
      ...(name === 'category' && { subCategory: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subCategory || formData.priceTTC <= 0) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (editingService) {
      // Update existing service
      setServices(prev => prev.map(service => 
        service.id === editingService.id ? { ...formData, id: editingService.id } : service
      ));
      showToast('Service mis à jour avec succès', 'success');
      setEditingService(null);
    } else {
      // Create new service
      const newService = { ...formData, id: Date.now() };
      setServices(prev => [...prev, newService]);
      showToast('Service créé avec succès', 'success');
      setShowCreateForm(false);
    }
    
    setFormData(defaultService);
  };

  const handleEdit = (service) => {
    setFormData(service);
    setEditingService(service);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setFormData(defaultService);
    setEditingService(null);
    setShowCreateForm(false);
  };

  const handleDelete = (serviceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
      showToast('Service supprimé', 'info');
    }
  };

  const toggleActive = (serviceId) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, isActive: !service.isActive } : service
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes services</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos services, tarifs et disponibilités.
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingService(null);
              setFormData(defaultService);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau service
          </button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingService) && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingService ? 'Modifier le service' : 'Créer un nouveau service'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ex: Réparation moteur"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="auto">Auto</option>
                    <option value="plomberie">Plomberie</option>
                    <option value="serrurerie">Serrurerie</option>
                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service *
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Choisir...</option>
                    {categoryOptions[formData.category]?.map(subCat => (
                      <option key={subCat} value={subCat}>{subCat}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes) *
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="input"
                    min="15"
                    max="480"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix TTC (€) *
                  </label>
                  <input
                    type="number"
                    name="priceTTC"
                    value={formData.priceTTC}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    rows={3}
                    placeholder="Décrivez votre service..."
                  />
                </div>

                {/* Options */}
                <div className="md:col-span-2">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requiresDisplacement"
                        checked={formData.requiresDisplacement}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Nécessite un déplacement
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isEmergency"
                        checked={formData.isEmergency}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Service d'urgence
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Service actif
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingService ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun service
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier service pour commencer à recevoir des réservations.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un service
              </button>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <span className="badge badge-info">
                        {service.category}
                      </span>
                      {service.isEmergency && (
                        <span className="badge badge-warning">Urgence</span>
                      )}
                      {!service.isActive && (
                        <span className="badge badge-error">Inactif</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-1">{service.description}</p>
                    
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <span>Type: {service.subCategory}</span>
                      <span>Durée: {service.durationMinutes}min</span>
                      <span>Prix: {service.priceTTC}€</span>
                      {service.requiresDisplacement && <span>À domicile</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(service.id)}
                      className={`p-2 rounded-lg ${
                        service.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={service.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {service.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProServices;
