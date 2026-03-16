import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldOff, Trash2, Search, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({ total: 0, pros: 0, clients: 0, active: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get('/api/admin/users');
      const list = res.data || [];
      setUsers(list);
      setStats({
        total: list.length,
        pros: list.filter(u => u.role === 'pro').length,
        clients: list.filter(u => u.role === 'client').length,
        active: list.filter(u => u.isActive).length,
      });
    } catch (err) {
      console.error('Admin fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleExempt = async (userId, currentExempt) => {
    setActionLoading(userId + '_exempt');
    try {
      await apiRequest.patch(`/api/admin/users/${userId}/exempt`, { exempt: !currentExempt });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isExempt: !currentExempt } : u));
    } catch (err) {
      alert('Erreur lors de la modification.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (userId, currentActive) => {
    setActionLoading(userId + '_active');
    try {
      await apiRequest.patch(`/api/admin/users/${userId}/status`, { isActive: !currentActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentActive } : u));
    } catch (err) {
      alert('Erreur lors de la modification.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Supprimer définitivement ce compte ?')) return;
    setActionLoading(userId + '_delete');
    try {
      await apiRequest.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert('Erreur lors de la suppression.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.businessName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      pro: 'bg-blue-100 text-blue-700',
      client: 'bg-gray-100 text-gray-600',
    };
    const labels = { admin: 'Admin', pro: 'Pro', client: 'Client' };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
        {labels[role] || role}
      </span>
    );
  };

  const subBadge = (status) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-sm text-gray-500">Connecté en tant que {user?.email}</p>
          </div>
          <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total utilisateurs', value: stats.total, color: 'blue' },
            { label: 'Professionnels', value: stats.pros, color: 'indigo' },
            { label: 'Clients', value: stats.clients, color: 'green' },
            { label: 'Comptes actifs', value: stats.active, color: 'emerald' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + table */}
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
            <span className="text-sm text-gray-500">{filtered.length} résultats</span>
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
                        <div>
                          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                          {u.businessName && <p className="text-xs text-blue-600">{u.businessName}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3">
                        {u.role === 'pro' ? (
                          <div className="flex flex-col gap-1">
                            {subBadge(u.isExempt ? 'exempt' : (u.subscriptionStatus || 'inactive'))}
                            {u.subscriptionPlan && (
                              <span className="text-xs text-gray-400">{u.subscriptionPlan}</span>
                            )}
                          </div>
                        ) : <span className="text-gray-400">—</span>}
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
                          {/* Exempt toggle (pro only) */}
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
                          {/* Active toggle */}
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
                          {/* Delete */}
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

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">ℹ️ Gestion des exemptions</p>
          <p>L'icône <Shield className="inline w-4 h-4" /> exempte un compte professionnel de l'obligation d'abonnement (accès illimité). 
          Utile pour les comptes de test ou les partenaires.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
