import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

const ProDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, apptRes] = await Promise.all([
          apiRequest.get('/api/stats/pro'),
          apiRequest.get('/api/appointments'),
        ]);
        setStats(statsRes.data);
        setRecentBookings((apptRes.data.appointments || []).slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const statusBadge = (status) => {
    const map = {
      pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepté', cls: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Terminé', cls: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-800' },
      refused: { label: 'Refusé', cls: 'bg-gray-100 text-gray-700' },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  const acceptBooking = async (id) => {
    await apiRequest.patch(`/api/appointments/${id}/status`, { status: 'accepted' });
    setRecentBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'accepted' } : b));
  };

  const refuseBooking = async (id) => {
    await apiRequest.patch(`/api/appointments/${id}/status`, { status: 'refused' });
    setRecentBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'refused' } : b));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );

  const subStatus = user?.isSubscriptionExempt ? 'Exempté (admin)' :
    user?.subscriptionStatus === 'trialing' ? "Essai gratuit" :
    user?.subscriptionStatus === 'active' ? `Plan ${user.subscriptionPlan === 'premium' ? 'Premium' : 'Starter'}` : 'Inactif';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bonjour, {user?.companyName || user?.firstName} 👋</h1>
            <p className="text-gray-500 mt-1">Tableau de bord professionnel — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <Link to="/pro/dashboard/subscription" className="flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-100">
            <CheckCircle className="w-4 h-4" /> {subStatus}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: AlertCircle, label: 'En attente', value: stats?.pendingCount ?? '—', color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: Calendar, label: "Aujourd'hui", value: stats?.todayCount ?? '—', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: DollarSign, label: 'CA du mois', value: stats ? `${stats.monthlyRevenue}€` : '—', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Star, label: 'Note moyenne', value: stats ? `${(stats.averageRating || 0).toFixed(1)} ⭐` : '—', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Réservations récentes</h2>
              <Link to="/pro/dashboard/bookings" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">Voir tout <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">Aucune réservation pour l'instant.</div>
              ) : recentBookings.map(b => (
                <div key={b._id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{b.serviceId?.name || 'Service'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.clientId?.firstName} {b.clientId?.lastName} · {new Date(b.scheduledDate).toLocaleDateString('fr-FR')} à {b.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge(b.status)}
                    <span className="text-sm font-semibold text-gray-700">{b.finalPrice}€</span>
                    {b.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => acceptBooking(b._id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Accepter"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => refuseBooking(b._id)} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Refuser"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Accès rapide</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
          { to: '/pro/dashboard/bookings', label: 'Réservations', icon: Calendar },
                  { to: '/pro/dashboard/schedule', label: 'Planning', icon: Clock },
                  { to: '/pro/dashboard/services', label: 'Services', icon: TrendingUp },
                  { to: '/pro/dashboard/stats', label: 'Statistiques', icon: Users },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:border-primary-300 hover:bg-primary-50 text-gray-600 hover:text-primary-700 text-xs font-medium transition-colors">
                    <Icon className="w-5 h-5" />{label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Monthly chart mini */}
            {stats?.monthlyData && stats.monthlyData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Réservations / mois</h3>
                <div className="flex items-end gap-2 h-20">
                  {stats.monthlyData.map((d, i) => {
                    const maxVal = Math.max(...stats.monthlyData.map(x => x.bookings), 1);
                    const pct = Math.round((d.bookings / maxVal) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary-500 rounded-t opacity-80" style={{ height: `${Math.max(pct, 4)}%` }} title={`${d.bookings} RDV`} />
                        <span className="text-xs text-gray-400 leading-none">{d.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
