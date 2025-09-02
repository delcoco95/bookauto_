import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';
import { searchServices } from '../services/services';
import { Link } from 'react-router-dom';

const Search = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    category: '',
    subCategory: '',
    date: '',
    radius: 25,
    ratingMin: 0,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    {
      id: 'auto',
      name: 'Auto',
      subCategories: ['Réparation', 'Entretien', 'Dépannage'],
    },
    {
      id: 'plomberie',
      name: 'Plomberie',
      subCategories: ['Dépannage', 'Installation', 'Rénovation'],
    },
    {
      id: 'serrurerie',
      name: 'Serrurerie',
      subCategories: ['Ouverture de porte', 'Installation', 'Sécurité'],
    },
  ];

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'category' && { subCategory: '' }),
    }));
  };

  const doSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const params = {
      location: searchFilters.location || undefined,
      category: searchFilters.category || undefined,
      subCategory: searchFilters.subCategory || undefined,
      radiusKm: searchFilters.radius,
      ratingMin: searchFilters.ratingMin,
      date: searchFilters.date || undefined,
    };
    const res = await searchServices(params);
    setResults(res.success ? res.data.professionals : []);
    setLoading(false);
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === searchFilters.category
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Rechercher un professionnel
          </h1>
          <form
            onSubmit={doSearch}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ville ou code postal"
                  value={searchFilters.location}
                  onChange={(e) =>
                    handleFilterChange('location', e.target.value)
                  }
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={searchFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">Toutes</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                value={searchFilters.subCategory}
                onChange={(e) =>
                  handleFilterChange('subCategory', e.target.value)
                }
                className="input"
                disabled={!selectedCategory}
              >
                <option value="">Tous</option>
                {selectedCategory?.subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date souhaitée
              </label>
              <input
                type="date"
                value={searchFilters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="lg:col-span-2 flex items-end">
              <button className="btn btn-primary w-full" disabled={loading}>
                <SearchIcon className="w-4 h-4 mr-2" />{' '}
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
            <div className="lg:col-span-1 flex items-end">
              <button type="button" className="btn btn-outline w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filtres
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rayon: {searchFilters.radius} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={searchFilters.radius}
                  onChange={(e) =>
                    handleFilterChange('radius', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note minimum
                </label>
                <select
                  value={searchFilters.ratingMin}
                  onChange={(e) =>
                    handleFilterChange('ratingMin', parseFloat(e.target.value))
                  }
                  className="input"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={4}>4 étoiles et plus</option>
                  <option value={4.5}>4.5 étoiles et plus</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Recherchez des professionnels
                  </h3>
                  <p className="text-gray-600">
                    Utilisez les filtres ci-dessus pour trouver le professionnel
                    qu'il vous faut.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map(({ pro, services, distance }) => (
                    <div
                      key={pro._id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {pro.companyName ||
                              pro.firstName + ' ' + pro.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Note: {pro.averageRating || 'N/A'} •{' '}
                            {pro.totalReviews || 0} avis
                          </p>
                          {typeof distance === 'number' && (
                            <p className="text-sm text-gray-500">
                              À {distance} km
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/pro/${pro._id}`}
                          className="btn btn-outline"
                        >
                          Voir le profil
                        </Link>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        Services:{' '}
                        {services
                          .slice(0, 3)
                          .map((s) => s.name)
                          .join(', ')}
                        {services.length > 3 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
