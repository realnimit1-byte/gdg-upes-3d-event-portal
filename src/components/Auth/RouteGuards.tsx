import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PortalLoadingScreen: React.FC<{ label?: string }> = ({
  label = 'Loading portal session...',
}) => (
  <div className="min-h-screen bg-[#080B18] text-slate-100 flex items-center justify-center px-4">
    <div className="rounded-2xl bg-[#11121D] border border-white/10 px-8 py-6 text-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#3AD4F5] border-t-transparent animate-spin mx-auto" />
      <p className="text-xs font-mono-tech text-slate-300">{label}</p>
    </div>
  </div>
);

/**
 * Browser-local navigation guard for the Student Portal.
 * Controls client-side routing flow; does not represent server-side security.
 */
export const StudentRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, student } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PortalLoadingScreen label="Restoring student session..." />;
  }

  if (!student) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/student/login?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

/**
 * Browser-local navigation guard for the Admin Portal.
 * Controls client-side routing flow; does not represent production backend access control.
 */
export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, admin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PortalLoadingScreen label="Restoring administrator session..." />;
  }

  if (!admin) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/admin/login?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};
