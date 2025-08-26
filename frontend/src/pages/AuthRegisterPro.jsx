import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const AuthRegisterPro = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Inscription professionnelle
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cette page sera bientôt disponible
          </p>
        </div>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              L'inscription des professionnels sera disponible prochainement.
            </p>
            <Link to="/register" className="btn btn-primary">
              Créer un compte client
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRegisterPro;
