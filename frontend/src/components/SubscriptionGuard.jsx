import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard for pro routes: blocks access if subscription is inactive,
 * unless the pro account is exempt (set by admin).
 */
const SubscriptionGuard = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin bypass
  if (user?.role === 'admin') return children;

  // Exempt accounts (set by admin) bypass subscription check
  if (user?.isExempt) return children;

  // Active or trialing subscription
  const activeStatuses = ['active', 'trialing', 'exempt'];
  if (activeStatuses.includes(user?.subscriptionStatus)) return children;

  // No active subscription → redirect to subscription page
  return <Navigate to="/pro/dashboard/subscription" replace />;
};

export default SubscriptionGuard;
