import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, Shield, Clock, Phone, ChevronLeft,
  Calendar, Award, MessageCircle, Image as ImageIcon,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { apiRequest } from '../services/api';

const DAY_LABELS = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const categoryImages = {
  auto: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80',
  plomberie: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=80',
  serrurerie: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
};

const StarRating = ({ rating, count, size = 'sm' }) => {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      {count !== undefined && (
        <span className={`text-gray-500 ml-1 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          ({count} avis)
        </span>
      )}
    </div>
  );
};

const ProDetail = () => {
  const { id } = useParams();
  const [pro, setPro] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [proRes, servicesRes] = await Promise.all([
          apiRequest.get(`/api/users/${id}/public`),
          apiRequest.get(`/api/services?proId=${id}`),
        ]);
        setPro(proRes.data);
        setServices(servicesRes.data?.professionals?.[0]?.services || []);
        try {
          const reviewsRes = await apiRequest.get(`/api/reviews/pro/${id}`);
          setReviews(reviewsRes.data?.reviews || []);
        } catch (_) {
          // reviews not critical
        }
      } catch (_err) {
        setError('Professionnel non trouve');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !pro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Professionnel introuvable</h2>
          <Link to="/search" className="text-primary-600 hover:underline">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  const mainCategory = pro.categories?.[0] || 'auto';
  const coverImg = categoryImages[mainCategory] || categoryImages.auto;
  const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.priceTTC || 0)) : null;
  const photos = pro.photos?.filter(Boolean) || [];
  const schedule = pro.defaultSchedule || {};
  const openDays = DAY_ORDER.filter((d) => schedule[d]?.isOpen);

  const TABS = [
    { key: 'services', label: `Services (${services.length})` },
    { key: 'disponibilite', label: 'Disponibilité' },
    { key: 'avis', label: `Avis (${reviews.length})` },
    { key: 'infos', label: 'Informations' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Photo" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link to="/search" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux résultats
        </Link>
      </div>

      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mt-2">
        <img src={coverImg} alt={mainCategory} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {pro.isSiretVerified && (
                <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Professionnel vérifié
                </span>
              )}
              {pro.subscriptionPlan === 'premium' && (
                <span className="bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Premium
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {pro.companyName || `${pro.firstName} ${pro.lastName}`}
            </h1>
            {pro.companyAddress?.city && (
              <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span>
                  {pro.companyAddress.city}
                  {pro.companyAddress.zipCode ? ` (${pro.companyAddress.zipCode})` : ''}
                </span>
              </div>
            )}
            <div className="mt-2">
              <StarRating rating={pro.averageRating || 0} count={pro.totalReviews} size="lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {pro.businessDescription && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">À propos</h2>
                <p className="text-gray-600 leading-relaxed">{pro.businessDescription}</p>
              </div>
            )}

            {/* Photos gallery */}
            {photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" /> Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxImg(url)}
                      className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" id="pro-tabs">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 min-w-max py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === key
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── Services tab ── */}
                {activeTab === 'services' && (
                  <div className="space-y-3">
                    {services.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6">
                        Aucun service disponible pour le moment.
                      </p>
                    ) : (
                      services.map((service) => (
                        <div
                          key={service._id}
                          className="border border-gray-100 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3.5 h-3.5" /> {service.durationMinutes} min
                                </span>
                                {service.isEmergency && (
                                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    Urgence
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-gray-900">
                                {service.priceTTC} €
                              </div>
                              <div className="text-xs text-gray-400 mb-2">TTC</div>
                              <Link
                                to={`/pro/${pro._id}/book/${service._id}`}
                                className="btn btn-primary text-xs py-1.5 px-3"
                              >
                                Réserver
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── Disponibilité tab ── */}
                {activeTab === 'disponibilite' && (
                  <div>
                    {openDays.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6">
                        Aucune disponibilité renseignée.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {DAY_ORDER.map((day) => {
                          const slot = schedule[day];
                          return (
                            <div
                              key={day}
                              className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${
                                slot?.isOpen ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              <span className="font-medium text-sm w-28">{DAY_LABELS[day]}</span>
                              {slot?.isOpen ? (
                                <span className="text-sm font-semibold">
                                  {slot.start} – {slot.end}
                                </span>
                              ) : (
                                <span className="text-sm">Fermé</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Avis tab ── */}
                {activeTab === 'avis' && (
                  <div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Aucun avis pour le moment.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                  {review.clientId?.firstName?.[0] || 'A'}
                                </div>
                                <span className="font-medium text-sm text-gray-900">
                                  {review.clientId?.firstName || 'Anonyme'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <StarRating rating={review.rating} />
                            {review.comment && (
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Infos tab ── */}
                {activeTab === 'infos' && (
                  <div className="space-y-4">
                    {pro.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Téléphone</div>
                          <div className="font-medium text-gray-900">{pro.phone}</div>
                        </div>
                      </div>
                    )}
                    {pro.companyAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Adresse</div>
                          <div className="font-medium text-gray-900">
                            {pro.companyAddress.street && <div>{pro.companyAddress.street}</div>}
                            <div>
                              {pro.companyAddress.zipCode} {pro.companyAddress.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {pro.categories?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Domaines d'activité</div>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {pro.categories.map((c) => (
                              <span
                                key={c}
                                className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full capitalize"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {pro.serviceRadius && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Rayon d'intervention</div>
                          <div className="font-medium text-gray-900">
                            {pro.serviceRadius} km autour de {pro.companyAddress?.city}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Mini-map */}
                    {pro.latitude && pro.longitude && (
                      <div
                        className="mt-4 rounded-xl overflow-hidden border border-gray-200"
                        style={{ height: '200px' }}
                      >
                        <MapContainer
                          center={[pro.latitude, pro.longitude]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[pro.latitude, pro.longitude]} />
                        </MapContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-700 font-bold text-xl">
                    {(pro.companyName || pro.firstName || 'P')[0].toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">
                  {pro.companyName || `${pro.firstName} ${pro.lastName}`}
                </h3>
                <StarRating rating={pro.averageRating || 0} count={pro.totalReviews} />
              </div>

              {minPrice !== null && (
                <div className="bg-gray-50 rounded-lg p-3 text-center mb-4">
                  <div className="text-xs text-gray-500">À partir de</div>
                  <div className="text-2xl font-bold text-primary-600">{minPrice} €</div>
                </div>
              )}

              {/* Scroll to services tab */}
              <button
                onClick={() => {
                  setActiveTab('services');
                  document.getElementById('pro-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full btn btn-primary text-center mb-3"
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Prendre rendez-vous
              </button>

              {pro.phone && (
                <a href={`tel:${pro.phone}`} className="block w-full btn btn-outline text-center">
                  <Phone className="w-4 h-4 mr-2 inline" />
                  {pro.phone}
                </a>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {pro.isSiretVerified && (
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Professionnel vérifié SIRET</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Réservation en ligne 24h/24</span>
                </div>
                {openDays.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Ouvert {openDays.length} jour{openDays.length > 1 ? 's' : ''}/semaine
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDetail;
