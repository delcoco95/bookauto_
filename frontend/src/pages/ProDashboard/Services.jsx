import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Clock, Euro, Zap, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { listMyServices, createService, updateService, deleteService } from '../../services/services';

const SUB_CATEGORIES = {
  auto:        ['Réparation', 'Entretien', 'Dépannage', 'Vidange', 'Pneus', 'Carrosserie', 'Diagnostic', 'Autre'],
  plomberie:   ['Dépannage urgence', 'Installation', 'Rénovation', 'Détartrage', 'Fuite', 'Autre'],
  serrurerie:  ['Ouverture de porte', 'Installation serrure', 'Sécurité', 'Dépannage', 'Blindage', 'Autre'],
};

const CATEGORY_LABELS = { auto: 'Automobile', plomberie: 'Plomberie', serrurerie: 'Serrurerie' };

const ProServices = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const proCategory = user?.categories?.[0] || 'auto';
  const subCatOptions = SUB_CATEGORIES[proCategory] || SUB_CATEGORIES.auto;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const defaultForm = {
    name: '', subCategory: '', description: '',
    durationMinutes: 60, priceTTC: 0,
    isActive: true, isEmergency: false, requiresDisplacement: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listMyServices();
    setServices(res.success ? res.data.services || res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'durationMinutes' || name === 'priceTTC') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subCategory || formData.priceTTC <= 0) {
      showToast('Remplissez tous les champs obligatoires', 'error');
      return;
    }
    setSubmitting(true);
    const payload = { ...formData, category: proCategory };
    const res = editingId
      ? await updateService(editingId, payload)
      : await createService(payload);
    if (res.success) {
      showToast(editingId ? 'Service mis à jour ✅' : 'Service créé ✅', 'success');
      resetForm();
      load();
    } else {
      showToast(res.error || 'Erreur', 'error');
    }
    setSubmitting(false);
  };

  const handleEdit = (s) => {
    setFormData({ name: s.name, subCategory: s.subCategory, description: s.description || '', durationMinutes: s.durationMinutes, priceTTC: s.priceTTC, isActive: s.isActive, isEmergency: s.isEmergency, requiresDisplacement: s.requiresDisplacement });
    setEditingId(s._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    const res = await deleteService(id);
    if (res.success) { showToast('Service supprimé', 'info'); load(); }
    else showToast('Erreur suppression', 'error');
  };

  const handleToggleActive = async (s) => {
    const res = await updateService(s._id, { isActive: !s.isActive });
    if (res.success) load();
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes services</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Car className="w-4 h-4" /> Domaine : <span className="font-medium text-gray-700">{CATEGORY_LABELS[proCategory]}</span>
              <span className="text-gray-300 mx-1">·</span> {services.length} service{services.length !== 1 ? 's' : ''}
            </p>
          </div>
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Nouveau service
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Modifier le service' : 'Créer un service'}</h2>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du service *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Ex: Réparation moteur" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de service *</label>
                  <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="input" required>
                    <option value="">Choisir...</option>
                    {subCatOptions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée (minutes) *</label>
                  <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className="input" min="15" max="480" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix TTC (€) *</label>
                  <input type="number" name="priceTTC" value={formData.priceTTC} onChange={handleChange} className="input" min="0" step="0.01" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows={3} placeholder="Décrivez votre service..." />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-6">
                  {[
                    { name: 'requiresDisplacement', label: 'Nécessite un déplacement' },
                    { name: 'isEmergency', label: 'Service d\'urgence (disponible 24h/24)' },
                    { name: 'isActive', label: 'Service actif (visible par les clients)' },
                  ].map(opt => (
                    <label key={opt.name} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleChange} className="w-4 h-4 accent-primary-600" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />{submitting ? 'Sauvegarde...' : editingId ? 'Mettre à jour' : 'Créer le service'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Plus className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-4">Aucun service créé pour le moment.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">Créer mon premier service</button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(s => (
              <div key={s._id} className={`bg-white rounded-xl border ${s.isActive ? 'border-gray-100' : 'border-gray-200 opacity-70'} shadow-sm overflow-hidden`}>
                <div className="p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      {s.isEmergency && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Zap className="w-3 h-3" /> Urgence</span>}
                      {!s.isActive && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Désactivé</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{s.subCategory}</p>
                    {s.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{s.durationMinutes} min</span>
                      <span className="flex items-center gap-1 text-sm font-bold text-primary-600"><Euro className="w-3.5 h-3.5" />{s.priceTTC} TTC</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleActive(s)} className={`p-2 rounded-lg ${s.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title={s.isActive ? 'Désactiver' : 'Activer'}>
                      {s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEdit(s)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Modifier">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProServices;
