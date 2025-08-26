import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';

const Search = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    category: '',
    subCategory: '',
    date: '',
    radius: 25,
    ratingMin: 0,
  });

  const categories = [
    { id: 'auto', name: 'Auto', subCategories: ['Réparation', 'Entretien', 'Dépannage'] },
    { id: 'plomberie', name: 'Plomberie', subCategories: ['Dépannage', 'Installation', 'Rénovation'] },
    { id: 'serrurerie', name: 'Serrurerie', subCategories: ['Ouverture de porte', 'Installation', 'Sécurité'] },
  ];

  const handleFilterChange = (key, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'category' && { subCategory: '' }) // Reset subcategory when category changes
    }));
  };

  const selectedCategory = categories.find(cat => cat.id === searchFilters.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Rechercher un professionnel
          </h1>
          
          {/* Search Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Location */}
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
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Category */}
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
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                value={searchFilters.subCategory}
                onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                className="input"
                disabled={!selectedCategory}
              >
                <option value="">Tous</option>
                {selectedCategory?.subCategories.map(subCat => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
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

            {/* Search Button */}
            <div className="lg:col-span-2 flex items-end">
              <button className="btn btn-primary w-full">
                <SearchIcon className="w-4 h-4 mr-2" />
                Rechercher
              </button>
            </div>

            {/* Filters Button */}
            <div className="lg:col-span-1 flex items-end">
              <button className="btn btn-outline w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
              
              {/* Distance */}
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
                  onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note minimum
                </label>
                <select
                  value={searchFilters.ratingMin}
                  onChange={(e) => handleFilterChange('ratingMin', parseFloat(e.target.value))}
                  className="input"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={4}>4 étoiles et plus</option>
                  <option value={4.5}>4.5 étoiles et plus</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recherchez des professionnels
                </h3>
                <p className="text-gray-600">
                  Utilisez les filtres ci-dessus pour trouver le professionnel qu'il vous faut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
