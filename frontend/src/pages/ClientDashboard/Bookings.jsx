import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Star, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useUI } from '../../context/UIContext';

const statusConfig = {
  pending:   { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700' },
  accepted:  { label: 'Confirmé',    cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé',     cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé',      cls: 'bg-red-100 text-red-600' },
  refused:   { label: 'Refusé',      cls: 'bg-red-100 text-red-600' },
};

const ClientBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const { showToast } = useUI();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get('/api/appointments');
      setBookings(res.data.appointments || []);
    } catch {
      showToast('Impossible de charger les réservations.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Confirmer l\'annulation de ce rendez-vous ?')) return;
    setCancelling(id);
    try {
      await apiRequest.patch(`/api/appointments/${id}/status`, {
        status: 'cancelled',
        reason: 'Annulation par le client',
      });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      showToast('Réservation annulée.', 'success');
    } catch {
      showToast('Erreur lors de l\'annulation.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return ['pending', 'accepted'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'refused'].includes(b.status);
    return true;
  });

  const proName = (b) => b.proId?.companyName || `${b.proId?.firstName || ''} ${b.proId?.lastName || ''}`.trim() || 'Professionnel';
  const canCancel = (b) => ['pending', 'accepted'].includes(b.status) && new Date(b.scheduledDate) > new Date();
  const canReview = (b) => b.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
            <p className="text-gray-500 text-sm mt-1">Gérez vos rendez-vous</p>
          </div>
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['all','Toutes'],['upcoming','À venir'],['completed','Terminées'],['cancelled','Annulées']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === k ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune réservation</h3>
            <p className="text-gray-400 text-sm mb-6">Vous n'avez pas encore de réservation dans cette catégorie.</p>
            <Link to="/search" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Trouver un professionnel
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const cfg = statusConfig[b.status] || statusConfig.pending;
              return (
                <div key={b._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {b.serviceName || 'Prestation'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{proName(b)}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(b.scheduledDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                        </span>
                        {b.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {b.startTime}
                          </span>
                        )}
                        {b.serviceAddress?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {b.serviceAddress.city}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-gray-900">{b.finalPrice?.toFixed(2)} €</p>
                      {b.depositPaid && <p className="text-xs text-green-600 mt-0.5">Acompte payé ✓</p>}
                      <div className="flex flex-col gap-2 mt-3">
                        {canReview(b) && (
                          <Link to="/client/reviews"
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Star className="w-3.5 h-3.5" />
                            Laisser un avis
                          </Link>
                        )}
                        {canCancel(b) && (
                          <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 disabled:opacity-50">
                            <X className="w-3.5 h-3.5" />
                            {cancelling === b._id ? '...' : 'Annuler'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {b.clientNotes && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {b.clientNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBookings;

