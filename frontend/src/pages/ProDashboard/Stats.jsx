import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Star, CheckCircle, BarChart2, BanknoteIcon, ArrowDownToLine, X } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useUI } from '../../context/UIContext';

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-primary-600', bg = 'bg-primary-50' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const BarChart = ({ data, valueKey, labelKey, color = 'bg-primary-500', formatValue = v => v }) => {
  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((d, i) => {
        const pct = Math.max(Math.round((d[valueKey] / maxVal) * 100), 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className={`w-full ${color} rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-default`}
              style={{ height: `${pct}%` }}
              title={`${d[labelKey]}: ${formatValue(d[valueKey])}`}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
              {formatValue(d[valueKey])}
            </div>
            <span className="text-xs text-gray-400 leading-none">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};

const ProStats = () => {
  const { showToast } = useUI();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ iban: '', bankName: '', amount: '' });
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest.get('/api/stats/pro');
        setStats(res.data);
      } catch (err) {
        console.error('Stats load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    if (!payoutForm.iban || !payoutForm.amount) return;
    setPayoutLoading(true);
    try {
      const res = await apiRequest.post('/api/payouts/request', {
        iban: payoutForm.iban,
        bankName: payoutForm.bankName,
        amount: parseFloat(payoutForm.amount),
      });
      showToast('success', res.data.message || 'Demande de virement envoyée !');
      setShowPayoutModal(false);
      setPayoutForm({ iban: '', bankName: '', amount: '' });
      // Refresh stats
      const r = await apiRequest.get('/api/stats/pro');
      setStats(r.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la demande');
    }
    setPayoutLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Impossible de charger les statistiques.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes statistiques</h1>
        <p className="text-gray-500 mb-8">Vue globale de votre activité sur la plateforme</p>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={DollarSign} label="CA ce mois" value={`${stats.monthlyRevenue}€`} sub={`${stats.monthlyBookings} RDV`} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={TrendingUp} label="CA total" value={`${stats.totalRevenue}€`} sub={`${stats.completedCount} terminés`} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={CheckCircle} label="Taux d'acceptation" value={`${stats.acceptanceRate}%`} sub={`${stats.totalBookings} RDV total`} color="text-primary-600" bg="bg-primary-50" />
          <StatCard icon={Star} label="Note moyenne" value={(stats.averageRating || 0).toFixed(1)} sub={`${stats.totalReviews} avis`} color="text-yellow-600" bg="bg-yellow-50" />
        </div>

        {/* Available balance card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <BanknoteIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-100 font-medium">Solde disponible</p>
                <p className="text-4xl font-bold">{stats.availableBalance || 0} €</p>
                <p className="text-xs text-green-100 mt-1">Après commission plateforme (15%)</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPayoutForm(f => ({ ...f, amount: String(stats.availableBalance || 0) }));
                setShowPayoutModal(true);
              }}
              disabled={!stats.availableBalance || stats.availableBalance <= 0}
              className="flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownToLine className="w-5 h-5" />
              Demander un virement
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-green-100">
              💡 CA total : <strong>{stats.totalRevenue}€</strong> — Commissions prélevées : <strong>{Math.round(stats.totalRevenue / 0.85 * 0.15)}€</strong> — Traitement sous 3 à 5 jours ouvrés.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" /> Réservations par mois
            </h2>
            <p className="text-sm text-gray-500 mb-6">6 derniers mois</p>
            {stats.monthlyData && stats.monthlyData.length > 0 ? (
              <BarChart data={stats.monthlyData} valueKey="bookings" labelKey="month" color="bg-primary-500" />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Aucune donnée disponible</div>
            )}
          </div>

          {/* Revenue chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Chiffre d'affaires par mois
            </h2>
            <p className="text-sm text-gray-500 mb-6">6 derniers mois (part après commission)</p>
            {stats.monthlyData && stats.monthlyData.length > 0 ? (
              <BarChart data={stats.monthlyData} valueKey="revenue" labelKey="month" color="bg-green-500" formatValue={v => `${v}€`} />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Aucune donnée disponible</div>
            )}
          </div>

          {/* Summary stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-600" /> Résumé global
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'RDV en attente', value: stats.pendingCount, color: 'text-yellow-600' },
                { label: "RDV aujourd'hui", value: stats.todayCount, color: 'text-blue-600' },
                { label: 'RDV terminés', value: stats.completedCount, color: 'text-green-600' },
                { label: 'Total RDV', value: stats.totalBookings, color: 'text-gray-900' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          * Les revenus affichés correspondent à votre part après déduction de la commission plateforme (15%).
        </p>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-green-600" /> Demande de virement
              </h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayoutRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                <input
                  type="number"
                  min="1"
                  max={stats.availableBalance}
                  step="0.01"
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 150"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Solde disponible : <strong>{stats.availableBalance}€</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={payoutForm.iban}
                  onChange={e => setPayoutForm(f => ({ ...f, iban: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
                <input
                  type="text"
                  value={payoutForm.bankName}
                  onChange={e => setPayoutForm(f => ({ ...f, bankName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Crédit Agricole"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <strong>Note :</strong> Les virements sont traités sous 3 à 5 jours ouvrés. Vous recevrez une confirmation par email.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {payoutLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProStats;
