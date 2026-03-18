import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldOff, Trash2, Search, CheckCircle, XCircle, RefreshCw, TrendingUp, Calendar, Euro, Activity } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiRequest.get('/api/admin/users'),
        apiRequest.get('/api/admin/stats'),
      ]);
      setUsers(usersRes.data || []);
      setGlobalStats(statsRes.data || null);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleExempt = async (userId, currentExempt) => {
    setActionLoading(userId + '_exempt');
    try {
      await apiRequest.patch(`/api/admin/users/${userId}/exempt`, { exempt: !currentExempt });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isExempt: !currentExempt } : u));
    } catch { alert('Erreur lors de la modification.'); }
    finally { setActionLoading(null); }
  };

  const toggleActive = async (userId, currentActive) => {
    setActionLoading(userId + '_active');
    try {
      await apiRequest.patch(`/api/admin/users/${userId}/status`, { isActive: !currentActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentActive } : u));
    } catch { alert('Erreur lors de la modification.'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Supprimer définitivement ce compte ?')) return;
    setActionLoading(userId + '_delete');
    try {
      await apiRequest.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch { alert('Erreur lors de la suppression.'); }
    finally { setActionLoading(null); }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.companyName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const styles = { admin: 'bg-purple-100 text-purple-700', pro: 'bg-blue-100 text-blue-700', client: 'bg-gray-100 text-gray-600' };
    const labels = { admin: 'Admin', pro: 'Pro', client: 'Client' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-600'}`}>{labels[role] || role}</span>;
  };

  const subBadge = (u) => {
    const status = u.isExempt ? 'exempt' : (u.subscriptionStatus || 'inactive');
    const map = {
      active: { label: 'Actif', cls: 'bg-green-100 text-green-700' },
      trialing: { label: 'Essai', cls: 'bg-yellow-100 text-yellow-700' },
      exempt: { label: 'Exempté', cls: 'bg-indigo-100 text-indigo-700' },
      canceled: { label: 'Annulé', cls: 'bg-red-100 text-red-700' },
      inactive: { label: 'Inactif', cls: 'bg-gray-100 text-gray-500' },
    };
    const s = map[status] || map.inactive;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  const statCards = [
    { label: 'Utilisateurs', value: globalStats?.totalUsers ?? '…', icon: <Users className="w-5 h-5 text-blue-600" />, color: 'blue' },
    { label: 'Professionnels', value: globalStats?.totalPros ?? '…', icon: <Activity className="w-5 h-5 text-indigo-600" />, color: 'indigo' },
    { label: 'Clients', value: globalStats?.totalClients ?? '…', icon: <Users className="w-5 h-5 text-green-600" />, color: 'green' },
    { label: 'Réservations', value: globalStats?.totalAppointments ?? '…', icon: <Calendar className="w-5 h-5 text-orange-600" />, color: 'orange' },
    { label: 'Abonnements actifs', value: globalStats?.activeSubs ?? '…', icon: <TrendingUp className="w-5 h-5 text-teal-600" />, color: 'teal' },
    { label: 'CA plateforme', value: globalStats?.platformCA != null ? `${globalStats.platformCA.toFixed(2)} €` : '…', icon: <Euro className="w-5 h-5 text-yellow-600" />, color: 'yellow' },
    { label: 'Revenus totaux', value: globalStats?.totalRevenue != null ? `${globalStats.totalRevenue.toFixed(2)} €` : '…', icon: <TrendingUp className="w-5 h-5 text-purple-600" />, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-sm text-gray-500">Connecté en tant que {user?.email}</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-${s.color}-50 flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{loading ? '…' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly activity */}
        {globalStats?.monthlyStats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Activité (6 derniers mois)</h2>
            <div className="flex items-end gap-3 h-28">
              {globalStats.monthlyStats.map(m => {
                const max = Math.max(...globalStats.monthlyStats.map(x => x.count), 1);
                const pct = Math.round((m.count / max) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{m.count}</span>
                    <div className="w-full bg-blue-100 rounded-t" style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}>
                      <div className="w-full h-full bg-blue-500 rounded-t opacity-80"></div>
                    </div>
                    <span className="text-xs text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, entreprise..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} résultats</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium">Rôle</th>
                    <th className="text-left px-4 py-3 font-medium">Abonnement</th>
                    <th className="text-left px-4 py-3 font-medium">Statut</th>
                    <th className="text-left px-4 py-3 font-medium">Inscription</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        {u.companyName && <p className="text-xs text-blue-600">{u.companyName}</p>}
                      </td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3">
                        {u.role === 'pro' ? subBadge(u) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          {u.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {u.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {u.role === 'pro' && (
                            <button
                              onClick={() => toggleExempt(u._id, u.isExempt)}
                              disabled={actionLoading === u._id + '_exempt'}
                              title={u.isExempt ? 'Retirer exemption' : 'Exempter abonnement'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isExempt ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                              {u.isExempt ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => toggleActive(u._id, u.isActive)}
                              disabled={actionLoading === u._id + '_active'}
                              title={u.isActive ? 'Désactiver' : 'Activer'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                            >
                              {u.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u._id)}
                              disabled={actionLoading === u._id + '_delete'}
                              title="Supprimer"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">ℹ️ Gestion des exemptions</p>
          <p>L'icône <Shield className="inline w-4 h-4" /> exempte un professionnel de l'abonnement (accès illimité). Utile pour les comptes de test ou partenaires.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
