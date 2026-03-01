import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout Components
import AppShell from './components/layout/AppShell';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Settings from './pages/Settings';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import Complaints from './pages/Complaints';
import ToiletIssues from './pages/ToiletIssues';
import SmartBins from './pages/SmartBins';
import BioWaste from './pages/BioWaste';
import WardRanking from './pages/WardRanking';
import Reports from './pages/Reports';
import QRGenerator from './pages/officer/QRGenerator';
import WorkerAnalytics from './pages/officer/WorkerAnalytics';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenComplaints from './pages/citizen/CitizenComplaints';
import CitizenBioWaste from './pages/citizen/CitizenBioWaste';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';

/**
 * RoleRedirect Component
 * Redirects users to their role-specific dashboard
 */
function RoleRedirect() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null;

  if (!currentUser || !userRole) {
    return <Navigate to="/login" replace />;
  }

  const dashboardMap = {
    citizen: '/dashboard/citizen',
    worker: '/dashboard/worker',
    officer: '/dashboard/officer',
  };

  return <Navigate to={dashboardMap[userRole] || '/dashboard/citizen'} replace />;
}

/**
 * AppRoutes Component
 * Main routing logic
 */
function AppRoutes() {
  const { loading } = useAuth();

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-[#B7E4C7]/30 border-t-[#2D6A4F]"
        />
        <p className="mt-6 font-bold text-[#1B4332]">Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* PROTECTED DASHBOARD ROUTES */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                {/* OFFICER ROUTES */}
                <Route
                  path="officer"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <OfficerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="complaints"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <Complaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="toilet-issues"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <ToiletIssues />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="smart-bins"
                  element={
                    <ProtectedRoute allowedRoles={['officer', 'worker']}>
                      <SmartBins />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bio-waste"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <BioWaste />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ward-ranking"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <WardRanking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qr-generator"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <QRGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="worker-analytics"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <WorkerAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* CITIZEN ROUTES */}
                <Route
                  path="citizen"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="citizen/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="citizen/bio-waste"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenBioWaste />
                    </ProtectedRoute>
                  }
                />

                {/* WORKER ROUTES */}
                <Route
                  path="worker"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* SHARED ROUTES */}
                <Route path="settings" element={<Settings />} />

                {/* FALLBACK REDIRECT */}
                <Route path="/" element={<RoleRedirect />} />
                <Route path="*" element={<RoleRedirect />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* CATCH-ALL - Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Main App Component
 * Sets up providers and routing
 */
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#2E7D32',
                color: '#fff',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                fontSize: '13px',
              },
            }}
          />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
