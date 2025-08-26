import React from 'react';
import { MessageCircle } from 'lucide-react';

const ProMessages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Messagerie en cours de développement
          </h3>
          <p className="text-gray-600">
            Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProMessages;
