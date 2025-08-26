import React from 'react';
import { useParams } from 'react-router-dom';

const ProDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Détail Professionnel</h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-600">Détail du professionnel ID: {id} à implémenter.</p>
        </div>
      </div>
    </div>
  );
};

export default ProDetail;
