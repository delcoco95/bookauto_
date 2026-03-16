import React from 'react';
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminDashboard = lazy(() => import('../pages/AdminDashboard/Index'));

const AdminRoutes = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <Routes>
        <Route path="/*" element={<AdminDashboard />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default AdminRoutes;
