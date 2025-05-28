import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se la route richiede l'accesso da admin e l'utente non è admin, reindirizza alla pagina principale
  if (adminOnly && currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Altrimenti, renderizza i componenti figli
  return <Outlet />;
};

export default ProtectedRoute;
