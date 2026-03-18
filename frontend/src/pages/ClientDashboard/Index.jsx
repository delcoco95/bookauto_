import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, User, CheckCircle, Clock, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

const statusLabels = {
  pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Confirmé', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-600' },
  refused: { label: 'Refusé', cls: 'bg-red-100 text-red-600' },
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest.get('/api/appointments')
      .then(res => setBookings(res.data.appointments || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => ['pending','accepted'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');
  const pendingReviews = completed.length; // simplified: all completed = can review
  const recent = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de votre activité.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Prochains RDV', value: upcoming.length, icon: <Calendar className="w-5 h-5 text-blue-600" />, color: 'blue' },
            { label: 'Terminés', value: completed.length, icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'green' },
            { label: 'Avis à donner', value: pendingReviews, icon: <Star className="w-5 h-5 text-yellow-500" />, color: 'yellow' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '…' : s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Réservations récentes</h2>
              <Link to="/client/bookings" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Aucune réservation pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(b => {
                  const cfg = statusLabels[b.status] || statusLabels.pending;
                  const proName = b.proId?.companyName || `${b.proId?.firstName || ''} ${b.proId?.lastName || ''}`.trim();
                  return (
                    <div key={b._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{b.serviceName || 'Prestation'}</p>
                        <p className="text-xs text-gray-500">{proName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(b.scheduledDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{b.finalPrice?.toFixed(2)} €</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link to="/search" className="flex items-center gap-2 w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Search className="w-4 h-4" />
                  Nouvelle réservation
                </Link>
                <Link to="/client/profile" className="flex items-center gap-2 w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <Link to="/client/reviews" className="flex items-center gap-2 w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Star className="w-4 h-4" />
                  Mes avis
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-800 mb-1">💡 Conseil</p>
              <p className="text-xs text-blue-700">
                Laissez un avis après chaque prestation pour aider la communauté et améliorer la qualité des services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
