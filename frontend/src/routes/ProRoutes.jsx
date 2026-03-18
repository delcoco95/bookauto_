import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import SubscriptionGuard from '../components/SubscriptionGuard';

const ProDashboard = lazy(() => import('../pages/ProDashboard/Index'));
const ProProfile = lazy(() => import('../pages/ProDashboard/Profile'));
const ProServices = lazy(() => import('../pages/ProDashboard/Services'));
const ProSchedule = lazy(() => import('../pages/ProDashboard/Schedule'));
const ProBookings = lazy(() => import('../pages/ProDashboard/Bookings'));
const ProSubscription = lazy(() => import('../pages/ProDashboard/Subscription'));
const SubscriptionSuccess = lazy(() => import('../pages/ProDashboard/SubscriptionSuccess'));
const ProStats = lazy(() => import('../pages/ProDashboard/Stats'));
const ProPhotos = lazy(() => import('../pages/ProDashboard/Photos'));
const ProInvoices = lazy(() => import('../pages/ProDashboard/Invoices'));

const ProRoutes = () => {
  return (
    <ProtectedRoute requiredRole="pro">
      <Routes>
        {/* Subscription pages: accessible even without active subscription */}
        <Route path="/subscription" element={<ProSubscription />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<ProSubscription />} />

        {/* Protected routes: require active subscription */}
        <Route path="/*" element={
          <SubscriptionGuard>
            <Routes>
              <Route path="/" element={<ProDashboard />} />
              <Route path="/profile" element={<ProProfile />} />
              <Route path="/services" element={<ProServices />} />
              <Route path="/schedule" element={<ProSchedule />} />
              <Route path="/bookings" element={<ProBookings />} />
              <Route path="/stats" element={<ProStats />} />
              <Route path="/photos" element={<ProPhotos />} />
              <Route path="/invoices" element={<ProInvoices />} />
            </Routes>
          </SubscriptionGuard>
        } />
      </Routes>
    </ProtectedRoute>
  );
};

export default ProRoutes;
