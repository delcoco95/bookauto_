import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Search, Phone } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useUI } from '../../context/UIContext';

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  accepted:  { label: 'Accepté',     cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Terminé',     cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Annulé',      cls: 'bg-red-100 text-red-700 border-red-200' },
  refused:   { label: 'Refusé',      cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const ProBookings = () => {
  const { showToast } = useUI();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get('/api/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      showToast('Erreur chargement réservations', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status, notes = '') => {
    setUpdating(id + status);
    try {
      await apiRequest.patch(`/api/appointments/${id}/status`, { status, proNotes: notes });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      const labels = { accepted: 'acceptée', refused: 'refusée', completed: 'terminée' };
      showToast(`Réservation ${labels[status] || status}`, 'success');
    } catch (err) {
      showToast('Erreur mise à jour', 'error');
    }
    setUpdating(null);
  };

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      const name = `${a.clientId?.firstName} ${a.clientId?.lastName}`.toLowerCase();
      const service = (a.serviceId?.name || '').toLowerCase();
      if (!name.includes(term) && !service.includes(term)) return false;
    }
    return true;
  });

  // Group by date
  const grouped = filtered.reduce((acc, a) => {
    const key = new Date(a.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const counts = ['pending', 'accepted', 'completed', 'cancelled', 'refused'].reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
        <p className="text-gray-500 mb-6">{appointments.length} réservation{appointments.length > 1 ? 's' : ''} au total</p>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9 w-full text-sm"
              placeholder="Rechercher client, service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: `Tous (${appointments.length})` },
              { key: 'pending', label: `En attente (${counts.pending})` },
              { key: 'accepted', label: `Acceptés (${counts.accepted})` },
              { key: 'completed', label: `Terminés (${counts.completed})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  filter === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune réservation trouvée</p>
            {filter !== 'all' && <button onClick={() => setFilter('all')} className="mt-3 text-sm text-primary-600 hover:underline">Voir toutes</button>}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a)).map(([dateStr, appts]) => (
              <div key={dateStr}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">{dateStr}</h2>
                <div className="space-y-3">
                  {appts.sort((a, b) => a.startTime?.localeCompare(b.startTime)).map(appt => {
                    const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                    const isUpdating = updating?.startsWith(appt._id);
                    return (
                      <div key={appt._id} className={`bg-white rounded-xl shadow-sm border ${appt.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'} overflow-hidden`}>
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-2 text-gray-900 sm:w-24 flex-shrink-0">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-sm">{appt.startTime}</span>
                            {appt.endTime && <span className="text-xs text-gray-400">→ {appt.endTime}</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{appt.clientId?.firstName} {appt.clientId?.lastName}</p>
                                <p className="text-xs text-gray-500">{appt.serviceId?.name} · {appt.serviceId?.durationMinutes} min</p>
                                {appt.clientNotes && <p className="text-xs text-gray-400 mt-1 italic">"{appt.clientNotes}"</p>}
                              </div>
                            </div>
                          </div>

                          {/* Price + Status + Actions */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm font-bold text-gray-900">{appt.finalPrice}€</span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                            {appt.status === 'pending' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateStatus(appt._id, 'accepted')}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Accepter
                                </button>
                                <button
                                  onClick={() => updateStatus(appt._id, 'refused')}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Refuser
                                </button>
                              </div>
                            )}
                            {appt.status === 'accepted' && (
                              <button
                                onClick={() => updateStatus(appt._id, 'completed')}
                                disabled={isUpdating}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Marquer terminé
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Payment info bar */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {appt.isFullyPaid ? '✅ Payé en totalité' : appt.depositPaid ? `💳 Acompte versé (${appt.depositPercentage || 15}%)` : '⏳ Paiement en attente'}
                          </span>
                          {appt.clientId?.phone && (
                            <a href={`tel:${appt.clientId.phone}`} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                              <Phone className="w-3 h-3" />{appt.clientId.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProBookings;
