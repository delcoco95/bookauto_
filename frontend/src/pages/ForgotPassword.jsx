import { useState } from 'react';
import { apiRequest, handleApiError } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: '' });
    try {
      await apiRequest.post('/api/auth/forgot-password', { email });
      setStatus({ loading: false, message: 'Si un compte existe, un email a été envoyé.', error: '' });
    } catch (err) {
      setStatus({ loading: false, message: '', error: handleApiError(err) });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mot de passe oublié</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 input" placeholder="vous@exemple.com" />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={status.loading}>
              {status.loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            {status.message && <p className="text-green-600 text-sm">{status.message}</p>}
            {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
