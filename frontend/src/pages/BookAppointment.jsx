import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
  const { proId, serviceId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [pro, setPro] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('deposit'); // 'deposit' | 'full'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await apiRequest.get(`/api/pros/${proId}`);
        const proData = res.data;
        setPro(proData);
        const svc = proData.services?.find(s => s._id === serviceId || s.id === serviceId);
        setService(svc || proData.services?.[0] || null);
      } catch (err) {
        setError('Impossible de charger les informations.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [proId, serviceId, isAuthenticated]);

  const depositAmount = service ? (service.price * 0.15).toFixed(2) : 0;
  const commissionRate = paymentMode === 'deposit' ? 0.10 : 0.15;
  const totalAfterCommission = service
    ? paymentMode === 'deposit'
      ? (service.price * 0.15).toFixed(2)
      : (service.price * (1 - commissionRate)).toFixed(2)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Veuillez choisir une date et un créneau.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const scheduledDate = new Date(`${selectedDate}T${selectedTime}`);
      const amountToPay = paymentMode === 'deposit'
        ? parseFloat(depositAmount)
        : service.price;

      await apiRequest.post('/api/appointments', {
        proId,
        serviceId,
        scheduledDate,
        paymentMode,
        amountPaid: amountToPay,
      });
      navigate('/client/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Réserver un rendez-vous</h1>
          {pro && (
            <p className="text-gray-500 mb-6">{pro.businessName || `${pro.firstName} ${pro.lastName}`}</p>
          )}

          {service && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="font-semibold text-blue-900">{service.name}</p>
              <p className="text-blue-700 text-sm mt-1">{service.description}</p>
              <p className="text-blue-900 font-bold mt-2">{service.price} €</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />Date du rendez-vous
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline w-4 h-4 mr-1" />Créneau horaire
              </label>
              <select
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choisir un créneau</option>
                {['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Payment mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline w-4 h-4 mr-1" />Mode de paiement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('deposit')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${paymentMode === 'deposit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <p className="font-semibold text-sm">Acompte 15%</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{depositAmount} €</p>
                  <p className="text-xs text-gray-500 mt-1">Reste à payer sur place</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('full')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${paymentMode === 'full' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <p className="font-semibold text-sm">Paiement total</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{service?.price} €</p>
                  <p className="text-xs text-gray-500 mt-1">Tout est réglé en avance</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Réservation en cours...' : `Confirmer et payer ${paymentMode === 'deposit' ? depositAmount : service?.price} €`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
