import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useUI } from '../../context/UIContext';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">
        <Star className={`w-6 h-6 transition-colors ${i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ appointment, onSubmitted }) => {
  const { showToast } = useUI();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 10) return showToast('Commentaire trop court (10 caractères min)', 'error');
    setSubmitting(true);
    try {
      await apiRequest.post('/api/reviews', {
        appointmentId: appointment._id,
        rating,
        comment: comment.trim(),
      });
      showToast('Avis publié !', 'success');
      onSubmitted();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'envoi", 'error');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <h4 className="text-sm font-semibold text-gray-800">Laisser un avis</h4>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Note globale</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Commentaire (10 à 500 caractères)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          className="input w-full resize-none text-sm"
          placeholder="Décrivez votre expérience..."
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>
      <button type="submit" disabled={submitting} className="btn btn-primary text-sm py-1.5">
        {submitting ? 'Publication...' : 'Publier l\'avis'}
      </button>
    </form>
  );
};

const ClientReviews = () => {
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, revRes] = await Promise.all([
        apiRequest.get('/api/appointments'),
        apiRequest.get('/api/reviews/my-reviews'),
      ]);
      setAppointments(appRes.data.appointments || []);
      setReviews(revRes.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reviewedIds = new Set(reviews.map(r => r.appointmentId?._id || r.appointmentId));
  const completedWithoutReview = appointments.filter(
    a => a.status === 'completed' && !reviewedIds.has(a._id)
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes avis</h1>

        {/* To review */}
        {completedWithoutReview.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              En attente de votre avis ({completedWithoutReview.length})
            </h2>
            <div className="space-y-3">
              {completedWithoutReview.map(appt => (
                <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-yellow-50 transition-colors"
                    onClick={() => setExpanded(expanded === appt._id ? null : appt._id)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{appt.serviceId?.name || 'Service'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {appt.proId?.companyName || `${appt.proId?.firstName} ${appt.proId?.lastName}`} · {new Date(appt.scheduledDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {expanded === appt._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expanded === appt._id && (
                    <div className="px-4 pb-4">
                      <ReviewForm appointment={appt} onSubmitted={() => { setExpanded(null); load(); }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published reviews */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Avis publiés ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Vous n'avez pas encore publié d'avis.</p>
              <p className="text-gray-400 text-xs mt-1">Après un rendez-vous terminé, vous pourrez noter le professionnel.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review._id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.proId?.companyName || 'Professionnel'}</p>
                      <p className="text-xs text-gray-500">{review.serviceId?.name} · {new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                  {review.reply?.content && (
                    <div className="mt-3 pl-3 border-l-2 border-primary-200 text-sm text-gray-600">
                      <p className="text-xs font-medium text-primary-700 mb-1">Réponse du professionnel</p>
                      <p>{review.reply.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientReviews;
