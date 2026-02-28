import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2E1C]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-civic-green animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    const redirectMap = { citizen: '/citizen', officer: '/', worker: '/worker' };
    return <Navigate to={redirectMap[userProfile.role] || '/login'} replace />;
  }

  return children;
}
