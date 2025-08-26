import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, MessageCircle, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const ClientBookings = () => {
  const [filter, setFilter] = useState('all');
  const { showToast } = useUI();

  // Mock data - à remplacer par de vraies données
  const bookings = [
    {
      id: 1,
      service: 'Réparation moteur',
      pro: {
        name: 'Garage Martin',
        rating: 4.8,
        avatar: null,
      },
      date: '2024-02-15',
      time: '10:00',
      status: 'accepted',
      price: 120,
      depositPaid: true,
      address: '123 Rue de la République, 75001 Paris',
      description: 'Réparation du moteur suite à panne',
      canCancel: true,
      canReview: false,
    },
    {
      id: 2,
      service: 'Vidange complète',
      pro: {
        name: 'Auto Service Pro',
        rating: 4.6,
        avatar: null,
      },
      date: '2024-02-10',
      time: '14:30',
      status: 'completed',
      price: 80,
      depositPaid: true,
      address: '456 Avenue des Champs, 75008 Paris',
      description: 'Vidange + changement filtre à huile',
      canCancel: false,
      canReview: true,
    },
    {
      id: 3,
      service: 'Dépannage serrure',
      pro: {
        name: 'Serrurerie Express',
        rating: 4.9,
        avatar: null,
      },
      date: '2024-02-18',
      time: '09:00',
      status: 'pending',
      price: 150,
      depositPaid: true,
      address: '789 Boulevard Saint-Germain, 75006 Paris',
      description: 'Ouverture de porte suite à clés perdues',
      canCancel: true,
      canReview: false,
    },
  ];

  const statusConfig = {
    pending: { label: 'En attente', class: 'badge-warning' },
    accepted: { label: 'Confirmé', class: 'badge-info' },
    completed: { label: 'Terminé', class: 'badge-success' },
    cancelled: { label: 'Annulé', class: 'badge-error' },
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'accepted'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const handleCancelBooking = (bookingId) => {
    // Simulation d'annulation
    showToast('Demande d\'annulation envoyée', 'info');
  };

  const handleContactPro = (booking) => {
    // Redirection vers messages
    showToast(`Message envoyé à ${booking.pro.name}`, 'success');
  };

  const handleLeaveReview = (booking) => {
    // Redirection vers page d'avis
    showToast(`Redirection vers la page d'avis pour ${booking.pro.name}`, 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
          <p className="text-gray-600 mt-2">
            Suivez et gérez toutes vos réservations de services.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'upcoming', label: 'À venir' },
              { key: 'completed', label: 'Terminées' },
              { key: 'cancelled', label: 'Annulées' },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune réservation
              </h3>
              <p className="text-gray-600">
                Vous n'avez pas encore de réservation dans cette catégorie.
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Left side - Booking info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.service}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-gray-600">{booking.pro.name}</span>
                          <div className="flex items-center ml-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {booking.pro.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${statusConfig[booking.status].class}`}>
                        {statusConfig[booking.status].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(booking.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.time}
                      </div>
                      <div className="flex items-start md:col-span-2">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{booking.address}</span>
                      </div>
                    </div>

                    {booking.description && (
                      <p className="text-gray-600 mt-3 text-sm">
                        {booking.description}
                      </p>
                    )}
                  </div>

                  {/* Right side - Price and actions */}
                  <div className="mt-6 lg:mt-0 lg:ml-8 lg:text-right">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {booking.price}€
                      </span>
                      {booking.depositPaid && (
                        <p className="text-sm text-green-600">
                          Acompte payé ✓
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleContactPro(booking)}
                        className="btn btn-outline btn-sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contacter
                      </button>

                      {booking.canReview && (
                        <button
                          onClick={() => handleLeaveReview(booking)}
                          className="btn btn-primary btn-sm"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Laisser un avis
                        </button>
                      )}

                      {booking.canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientBookings;
