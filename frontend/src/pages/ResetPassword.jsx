import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest, handleApiError } from '../services/api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Lien invalide');
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      await apiRequest.post('/api/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {done ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Mot de passe mis à jour</h1>
              <p className="text-gray-600">Vous pouvez maintenant vous connecter.</p>
              <Link to="/login" className="btn btn-primary">Se connecter</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau mot de passe</h1>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer</label>
                  <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 input" />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={loading || !token}>
                  {loading ? 'En cours...' : 'Valider'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
