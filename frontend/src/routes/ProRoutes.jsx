import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load components
const ProDashboard = lazy(() => import('../pages/ProDashboard/Index'));
const ProProfile = lazy(() => import('../pages/ProDashboard/Profile'));
const ProServices = lazy(() => import('../pages/ProDashboard/Services'));
const ProSchedule = lazy(() => import('../pages/ProDashboard/Schedule'));
const ProBookings = lazy(() => import('../pages/ProDashboard/Bookings'));
const ProMessages = lazy(() => import('../pages/ProDashboard/Messages'));
const ProSubscription = lazy(() => import('../pages/ProDashboard/Subscription'));
const ProStats = lazy(() => import('../pages/ProDashboard/Stats'));

const ProRoutes = () => {
  return (
    <ProtectedRoute requiredRole="pro">
      <Routes>
        <Route path="/" element={<ProDashboard />} />
        <Route path="/profile" element={<ProProfile />} />
        <Route path="/services" element={<ProServices />} />
        <Route path="/schedule" element={<ProSchedule />} />
        <Route path="/bookings" element={<ProBookings />} />
        <Route path="/messages" element={<ProMessages />} />
        <Route path="/subscription" element={<ProSubscription />} />
        <Route path="/stats" element={<ProStats />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ProRoutes;
