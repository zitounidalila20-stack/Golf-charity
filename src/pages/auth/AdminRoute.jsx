import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  // Check if user is admin (you can customize this logic)
  const isAdmin = user && profile?.email?.includes('admin');

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}