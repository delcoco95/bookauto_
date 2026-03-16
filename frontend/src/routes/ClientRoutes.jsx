import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load components
const ClientDashboard = lazy(() => import('../pages/ClientDashboard/Index'));
const ClientProfile = lazy(() => import('../pages/ClientDashboard/Profile'));
const ClientBookings = lazy(() => import('../pages/ClientDashboard/Bookings'));
const ClientReviews = lazy(() => import('../pages/ClientDashboard/Reviews'));

const ClientRoutes = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="/bookings" element={<ClientBookings />} />
        <Route path="/reviews" element={<ClientReviews />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ClientRoutes;
