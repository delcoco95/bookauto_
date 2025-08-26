import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  Star, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProDashboard = () => {
  const { user } = useAuth();

  // Mock data - à remplacer par de vraies données
  const stats = {
    pendingBookings: 3,
    todayBookings: 2,
    monthlyRevenue: 2450,
    averageRating: 4.8,
    totalReviews: 24,
    activeServices: 5,
  };

  const recentBookings = [
    {
      id: 1,
      service: 'Réparation moteur',
      client: 'Jean Dupont',
      date: '2024-02-15',
      time: '10:00',
      status: 'pending',
      price: 120,
    },
    {
      id: 2,
      service: 'Vidange',
      client: 'Marie Martin',
      date: '2024-02-15',
      time: '14:30',
      status: 'accepted',
      price: 60,
    },
    {
      id: 3,
      service: 'Dépannage urgence',
      client: 'Pierre Durand',
      date: '2024-02-16',
      time: '09:00',
      status: 'pending',
      price: 150,
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
            Tableau de bord - {user?.companyName}
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos réservations, services et suivez votre activité.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CA du mois</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue}€</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating}
                  <span className="text-sm text-gray-500 ml-1">
                    ({stats.totalReviews} avis)
                  </span>
                </p>
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
                  to="/pro/bookings"
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
                          Client: {booking.client}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString('fr-FR')} à {booking.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          {statusBadge(booking.status)}
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {booking.price}€
                        </p>
                        {booking.status === 'pending' && (
                          <div className="mt-2 space-x-2">
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              Accepter
                            </button>
                            <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Actions rapides
              </h2>

              <div className="space-y-4">
                <Link
                  to="/pro/services"
                  className="block w-full btn btn-primary"
                >
                  Gérer mes services
                </Link>

                <Link
                  to="/pro/schedule"
                  className="block w-full btn btn-outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Mon planning
                </Link>

                <Link
                  to="/pro/messages"
                  className="block w-full btn btn-outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Link>

                <Link
                  to="/pro/stats"
                  className="block w-full btn btn-outline"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistiques
                </Link>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Abonnement
              </h3>
              <div className="flex items-center justify-between">
                <span className="badge badge-success">Actif</span>
                <Link
                  to="/pro/subscription"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Gérer
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Votre abonnement pro est actif jusqu'au 15 mars 2024.
              </p>
            </div>

            {/* Tips Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Conseil du jour
              </h3>
              <p className="text-sm text-gray-600">
                Répondez rapidement aux demandes de réservation pour améliorer 
                votre classement et obtenir plus de clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
