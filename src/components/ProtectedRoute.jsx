import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-[#B7E4C7]/30 border-t-[#2D6A4F]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#1B4332]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-[#1B4332] tracking-tight">Civic Intelligence Loading</p>
          <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-[0.2em]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    // If user is from dashboard, redirect to their home dashboard
    const home = userProfile.role === 'citizen' ? '/dashboard/citizen'
      : userProfile.role === 'worker' ? '/dashboard/worker'
        : '/dashboard/officer';
    return <Navigate to={home} replace />;
  }

  return children;
}
