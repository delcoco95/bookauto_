import React, { useState } from 'react';
import { Camera, Trash2, Upload, Image } from 'lucide-react';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setTimeout(() => {
      setPhotos(prev => [...prev, ...newPhotos]);
      setUploading(false);
    }, 800);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes photos</h1>
        <p className="text-gray-500 mt-1">Ajoutez des photos de vos réalisations pour attirer plus de clients.</p>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-8 hover:border-blue-400 transition-colors">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Glissez vos photos ici ou cliquez pour sélectionner</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? 'Chargement...' : 'Choisir des photos'}
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <p className="text-xs text-gray-400 mt-3">PNG, JPG, WEBP jusqu'à 5 Mo chacune</p>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Image className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p>Aucune photo ajoutée pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <img src={photo.url} alt={photo.name} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Photos;
