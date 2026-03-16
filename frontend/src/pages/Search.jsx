import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, MapPin, Filter, Star, Shield, Clock, User, ChevronDown, X, Zap } from 'lucide-react';
import { searchServices } from '../services/services';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryImages = {
  auto: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80',
  plomberie: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  serrurerie: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
};
const categoryLabels = { auto: 'Automobile', plomberie: 'Plomberie', serrurerie: 'Serrurerie' };
const categoryColors = { auto: 'bg-blue-100 text-blue-700', plomberie: 'bg-cyan-100 text-cyan-700', serrurerie: 'bg-amber-100 text-amber-700' };

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 12); }, [center, map]);
  return null;
}

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
    ))}
    <span className="text-xs text-gray-500 ml-1 font-medium">{rating ? rating.toFixed(1) : 'N/A'}</span>
    <span className="text-xs text-gray-400">({count || 0})</span>
  </div>
);

const ProCard = ({ pro, services, distance }) => {
  const category = pro.categories?.[0] || 'auto';
  const img = categoryImages[category] || categoryImages.auto;
  const minPrice = services.length ? Math.min(...services.map(s => s.priceTTC || 9999)) : null;
  const displayName = pro.companyName || `${pro.firstName || ''} ${pro.lastName || ''}`.trim();
  const city = pro.city || pro.companyAddress?.city || pro.address?.city || '';

  return (
    <Link to={`/pro/${pro._id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={img}
            alt={category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          {/* Category badges bottom-left */}
          <div className="absolute bottom-2 left-3 flex gap-1 flex-wrap">
            {pro.categories?.slice(0, 2).map(c => (
              <span key={c} className="bg-white/95 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                {categoryLabels[c] || c}
              </span>
            ))}
          </div>
          {/* Verified badge top-right */}
          {pro.isSiretVerified && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Shield className="w-3 h-3" /> Vérifié
            </div>
          )}
          {/* Emergency badge top-left */}
          {services.some(s => s.isEmergency) && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Zap className="w-3 h-3" /> Urgence
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                {displayName}
              </h3>
              {city && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{city}</span>
                  {typeof distance === 'number' && (
                    <span className="text-xs text-gray-400 ml-1">• {distance} km</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <StarRating rating={pro.averageRating || 0} count={pro.totalReviews} />

          {/* Service tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {services.slice(0, 3).map((s, i) => (
              <span key={i} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />{s.name}
              </span>
            ))}
            {services.length > 3 && (
              <span className="bg-gray-50 border border-gray-200 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                +{services.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            {minPrice && minPrice < 9999 ? (
              <div>
                <span className="text-xs text-gray-400">À partir de </span>
                <span className="text-sm font-bold text-primary-600">{minPrice} €</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Prix sur demande</span>
            )}
            <span className="text-xs font-semibold text-primary-600 group-hover:underline">
              Voir le profil →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState({ location: '', category: urlCategory, name: '', date: '', radius: 25, ratingMin: 0 });
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState('pertinence');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState([46.603354, 1.888334]);
  const [searchCoords, setSearchCoords] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'auto', name: 'Automobile', subCategories: ['Réparation', 'Entretien', 'Dépannage', 'Vidange', 'Pneus'] },
    { id: 'plomberie', name: 'Plomberie', subCategories: ['Dépannage urgence', 'Installation', 'Rénovation'] },
    { id: 'serrurerie', name: 'Serrurerie', subCategories: ['Ouverture de porte', 'Installation', 'Sécurité'] },
    { id: 'electricite', name: 'Électricité', subCategories: ['Installation', 'Dépannage', 'Mise aux normes'] },
  ];

  const geocodeLocation = async (location) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&countrycodes=fr&limit=1`);
      const data = await res.json();
      if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {}
    return null;
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    const res = await searchServices({});
    setResults(res.success ? (res.data.professionals || []) : []);
    setLoading(false);
  }, []);

  // On mount: if category in URL, filter; otherwise load all
  useEffect(() => {
    if (urlCategory) {
      setLoading(true);
      setHasSearched(true);
      searchServices({ category: urlCategory }).then(res => {
        setResults(res.success ? (res.data.professionals || []) : []);
        setLoading(false);
      });
    } else {
      loadAll();
    }
  }, [urlCategory, loadAll]);

  const doSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    let coords = null;
    if (filters.location) {
      coords = await geocodeLocation(filters.location);
      if (coords) { setMapCenter([coords.lat, coords.lng]); setSearchCoords(coords); }
    }

    const params = {
      ...(filters.location && { location: filters.location }),
      ...(filters.category && { category: filters.category }),
      ...(filters.name && { name: filters.name }),
      ...(filters.date && { date: filters.date }),
      radiusKm: filters.radius,
      ratingMin: filters.ratingMin,
      ...(coords && { lat: coords.lat, lng: coords.lng }),
    };

    const res = await searchServices(params);
    setResults(res.success ? (res.data.professionals || []) : []);
    setLoading(false);
  };

  const clearFilters = () => {
    setFilters({ location: '', category: '', name: '', date: '', radius: 25, ratingMin: 0 });
    setSearchCoords(null);
    setMapCenter([46.603354, 1.888334]);
    loadAll();
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'rating') return (b.pro.averageRating || 0) - (a.pro.averageRating || 0);
    if (sortBy === 'price_asc') {
      const minA = a.services.length ? Math.min(...a.services.map(s => s.priceTTC || 9999)) : 9999;
      const minB = b.services.length ? Math.min(...b.services.map(s => s.priceTTC || 9999)) : 9999;
      return minA - minB;
    }
    if (sortBy === 'distance') return (a.distance || 999) - (b.distance || 999);
    return 0;
  });

  const hasActiveFilters = filters.location || filters.category || filters.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky search bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={doSearch} className="flex flex-wrap gap-2 items-end">
            {/* Name */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Professionnel</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Garage du Centre, Jean D..."
                  value={filters.name}
                  onChange={e => setFilters(p => ({ ...p, name: e.target.value }))}
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            </div>
            {/* Location */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ville ou code postal"
                  value={filters.location}
                  onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            </div>
            {/* Category */}
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
              <select
                value={filters.category}
                onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
                className="input py-2 text-sm"
              >
                <option value="">Toutes</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Date */}
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date souhaitée</label>
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                className="input py-2 text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Buttons */}
            <div className="flex gap-2 pb-0.5">
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} title="Effacer les filtres"
                  className="btn btn-outline py-2 text-sm text-gray-500 px-2.5">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline py-2 text-sm">
                <Filter className="w-4 h-4 mr-1" /> Filtres
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button type="submit" className="btn btn-primary py-2 text-sm" disabled={loading}>
                <SearchIcon className="w-4 h-4 mr-1" />
                {loading ? 'Recherche…' : 'Rechercher'}
              </button>
            </div>
          </form>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-6">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Rayon : {filters.radius} km</label>
                <input type="range" min="5" max="100" step="5" value={filters.radius}
                  onChange={e => setFilters(p => ({ ...p, radius: parseInt(e.target.value) }))}
                  className="block w-40" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Note minimum</label>
                <select value={filters.ratingMin}
                  onChange={e => setFilters(p => ({ ...p, ratingMin: parseFloat(e.target.value) }))}
                  className="input py-1 text-sm w-40">
                  <option value={0}>Toutes les notes</option>
                  <option value={4}>4 étoiles et +</option>
                  <option value={4.5}>4,5 étoiles et +</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Recherche en cours…</p>
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <SearchIcon className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  {hasSearched ? 'Aucun professionnel trouvé' : 'Chargement…'}
                </h3>
                <p className="text-sm text-gray-400">
                  {hasSearched ? 'Essayez de modifier vos critères de recherche.' : 'Nous préparons les résultats.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">
                    <span className="text-gray-900 font-bold">{sortedResults.length}</span>{' '}
                    professionnel{sortedResults.length > 1 ? 's' : ''} trouvé{sortedResults.length > 1 ? 's' : ''}
                  </p>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input py-1 text-xs w-40">
                    <option value="pertinence">Pertinence</option>
                    <option value="rating">Mieux notés</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
                {sortedResults.map(({ pro, services, distance }) => (
                  <ProCard key={pro._id} pro={pro} services={services} distance={distance} />
                ))}
              </>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="sticky top-[73px] rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ height: '620px' }}>
              <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={searchCoords ? [searchCoords.lat, searchCoords.lng] : null} />
                {results.map(({ pro, services }) =>
                  pro.latitude && pro.longitude ? (
                    <Marker key={pro._id} position={[pro.latitude, pro.longitude]}>
                      <Popup>
                        <div className="min-w-[190px]">
                          <p className="font-bold text-sm text-gray-900">{pro.companyName || `${pro.firstName} ${pro.lastName}`}</p>
                          <div className="flex items-center gap-1 my-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium">{pro.averageRating ? pro.averageRating.toFixed(1) : 'N/A'}</span>
                            <span className="text-xs text-gray-400">({pro.totalReviews || 0} avis)</span>
                          </div>
                          {services.length > 0 && (
                            <p className="text-xs text-gray-500 mb-2">{services.slice(0, 2).map(s => s.name).join(', ')}</p>
                          )}
                          <Link to={`/pro/${pro._id}`}
                            className="block text-center text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                            Voir le profil
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
