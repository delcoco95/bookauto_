import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Star, User, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();

  // Mock data - à remplacer par de vraies données
  const stats = {
    upcomingBookings: 2,
    completedBookings: 8,
    unreadMessages: 1,
    pendingReviews: 1,
  };

  const recentBookings = [
    {
      id: 1,
      service: 'Réparation moteur',
      pro: 'Garage Martin',
      date: '2024-02-15',
      status: 'accepted',
      price: 120,
    },
    {
      id: 2,
      service: 'Dépannage plomberie',
      pro: 'Plomberie Dupont',
      date: '2024-02-18',
      status: 'pending',
      price: 80,
    },
  ];

  const statusBadge = (status) => {
    const classes = {
      pending: 'badge badge-warning',
      accepted: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-error',
    };
    
    const labels = {
      pending: 'En attente',
      accepted: 'Accepté',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };

    return (
      <span className={classes[status] || 'badge'}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour {user?.firstName} !
          </h1>
          <p className="text-gray-600 mt-2">
            Voici un aperçu de vos réservations et activités récentes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prochains RDV</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avis à donner</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Réservations récentes
                </h2>
                <Link
                  to="/client/bookings"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir tout
                </Link>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {booking.service}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.pro}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          {statusBadge(booking.status)}
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {booking.price}€
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Actions rapides
              </h2>

              <div className="space-y-4">
                <Link
                  to="/search"
                  className="block w-full btn btn-primary"
                >
                  Nouvelle réservation
                </Link>

                <Link
                  to="/client/messages"
                  className="block w-full btn btn-outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mes messages
                </Link>

                <Link
                  to="/client/profile"
                  className="block w-full btn btn-outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon profil
                </Link>

                <Link
                  to="/client/reviews"
                  className="block w-full btn btn-outline"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Mes avis
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Conseil
              </h3>
              <p className="text-sm text-gray-600">
                N'oubliez pas de laisser un avis après vos prestations.
                Cela aide les autres utilisateurs et améliore la qualité du service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
