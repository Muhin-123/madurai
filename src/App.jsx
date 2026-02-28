import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ToiletIssues from './pages/ToiletIssues';
import SmartBins from './pages/SmartBins';
import BioWaste from './pages/BioWaste';
import WardRanking from './pages/WardRanking';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import QRGenerator from './pages/officer/QRGenerator';
import WorkerAnalytics from './pages/officer/WorkerAnalytics';

import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenComplaints from './pages/citizen/CitizenComplaints';
import CitizenBioWaste from './pages/citizen/CitizenBioWaste';

import WorkerDashboard from './pages/worker/WorkerDashboard';
import Landing from './pages/Landing';

// Redirects logged-in users to their dashboard; shows Landing for guests
function LandingOrDashboard() {
  const { userProfile, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (userProfile) {
    const roleRoute = userProfile.role === 'citizen' ? '/citizen'
      : userProfile.role === 'worker' ? '/worker'
        : '/officer';
    return <Navigate to={roleRoute} replace />;
  }
  return <Landing />;
}



function AuthRedirect() {
  const { userProfile, loading } = useAuth();
  if (loading) return null;
  if (!userProfile) return <Navigate to="/login" replace />;
  if (userProfile.role === 'citizen') return <Navigate to="/citizen" replace />;
  if (userProfile.role === 'worker') return <Navigate to="/worker" replace />;
  return <Navigate to="/officer" replace />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<LandingOrDashboard />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell pathname={location.pathname}>
              <Routes>
                {/* ── Officer Routes ── */}
                <Route
                  path="/officer"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <OfficerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <Complaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/toilet-issues"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <ToiletIssues />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-bins"
                  element={
                    <ProtectedRoute allowedRoles={['officer', 'worker']}>
                      <SmartBins />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bio-waste"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <BioWaste />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ward-ranking"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <WardRanking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/qr-generator"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <QRGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worker-analytics"
                  element={
                    <ProtectedRoute allowedRoles={['officer']}>
                      <WorkerAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* ── Citizen Routes ── */}
                <Route
                  path="/citizen"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/bio-waste"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenBioWaste />
                    </ProtectedRoute>
                  }
                />

                {/* ── Worker Routes ── */}
                <Route
                  path="/worker"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Settings */}
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

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
