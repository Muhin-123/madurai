import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquareWarning, Toilet, Trash2,
  Leaf, Trophy, BarChart3, Settings, X, QrCode, Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useBins } from '../../hooks/useFirebaseData';
import CleanMaduraiLogo from '../logo/CleanMaduraiLogo';

const OFFICER_NAV = [
  { path: '/officer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/toilet-issues', label: 'Toilet Issues', icon: Toilet },
  { path: '/smart-bins', label: 'Smart Bin Monitor', icon: Trash2 },
  { path: '/bio-waste', label: 'Bio-Waste Market', icon: Leaf },
  { path: '/ward-ranking', label: 'Ward Ranking', icon: Trophy },
  { path: '/qr-generator', label: 'QR Generator', icon: QrCode },
  { path: '/worker-analytics', label: 'Worker Analytics', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const CITIZEN_NAV = [
  { path: '/citizen', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/citizen/complaints', label: 'My Complaints', icon: MessageSquareWarning },
  { path: '/citizen/bio-waste', label: 'Bio-Waste Market', icon: Leaf },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const WORKER_NAV = [
  { path: '/worker', label: 'My Tasks', icon: LayoutDashboard, exact: true },
  { path: '/smart-bins', label: 'Smart Bins', icon: Trash2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const NAV_BY_ROLE = { officer: OFFICER_NAV, citizen: CITIZEN_NAV, worker: WORKER_NAV };

const ROLE_BADGE = {
  officer: { label: '🏛 Officer', color: 'bg-civic-blue/10 text-civic-blue dark:text-civic-green dark:bg-civic-green/10' },
  citizen: { label: '👤 Citizen', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  worker: { label: '🔧 Worker', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
};

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();
  const { userProfile } = useAuth();
  const { bins } = useBins();
  const location = useLocation();

  const role = userProfile?.role || 'citizen';
  const navItems = NAV_BY_ROLE[role] || CITIZEN_NAV;
  const onlineBins = bins.filter((b) => b.fill !== undefined).length;
  const badge = ROLE_BADGE[role];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-64 z-30 glass-sidebar flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <CleanMaduraiLogo size={40} />
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {userProfile && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-civic-blue to-civic-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(userProfile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{userProfile.name}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            {role === 'citizen' && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-civic-green font-semibold">
                <span>⭐</span>
                <span>{userProfile.points || 0} points</span>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <NavLink key={path} to={path}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'active bg-gradient-to-r from-civic-blue/15 to-civic-green/10 text-civic-blue dark:text-civic-green font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-civic-blue dark:hover:text-white'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-civic-blue to-civic-green text-white shadow-glow'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-civic-blue/10 group-hover:text-civic-blue dark:group-hover:text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-civic-blue dark:bg-civic-green"
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse-slow" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">System Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Bins Online</span>
                <span className="font-semibold text-civic-blue dark:text-civic-green">
                  {onlineBins > 0 ? `${onlineBins}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Firebase</span>
                <span className="font-semibold text-civic-green">● Connected</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3">
            Madurai Smart City Limited © 2024
          </p>
        </div>
      </motion.aside>
    </>
  );
}
