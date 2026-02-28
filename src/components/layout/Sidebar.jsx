import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquareWarning, Toilet, Trash2,
  Leaf, Trophy, BarChart3, Settings, X, QrCode, Users, LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import CleanMaduraiLogo from '../logo/CleanMaduraiLogo';

const OFFICER_NAV = [
  { path: '/dashboard/officer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/dashboard/toilet-issues', label: 'Toilet Issues', icon: Toilet },
  { path: '/dashboard/smart-bins', label: 'Bin Monitoring', icon: Trash2 },
  { path: '/dashboard/bio-waste', label: 'Marketplace', icon: Leaf },
  { path: '/dashboard/ward-ranking', label: 'Impact Rank', icon: Trophy },
  { path: '/dashboard/reports', label: 'Analytics', icon: BarChart3 },
];

const CITIZEN_NAV = [
  { path: '/dashboard/citizen', label: 'My Hub', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/citizen/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/dashboard/citizen/bio-waste', label: 'Marketplace', icon: Leaf },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const WORKER_NAV = [
  { path: '/dashboard/worker', label: 'My Tasks', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/smart-bins', label: 'Bin Monitor', icon: Trash2 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const NAV_BY_ROLE = { officer: OFFICER_NAV, citizen: CITIZEN_NAV, worker: WORKER_NAV };

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const role = userProfile?.role || 'citizen';
  const navItems = NAV_BY_ROLE[role] || CITIZEN_NAV;

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="fixed left-0 top-0 h-screen w-72 z-50 glass-sidebar flex flex-col"
      >
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CleanMaduraiLogo size={32} color="#B7E4C7" />
            <span className="font-black text-xl tracking-tighter text-[#B7E4C7]">CLEAN<span className="text-white/50">MADURAI</span></span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-[#B7E4C7]/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <NavLink key={path} to={path}>
                <div className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span className="text-sm tracking-wide">{label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-300 hover:bg-rose-500/10 transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#B7E4C7] font-black border border-[#B7E4C7]/20 shadow-lg">
              {(userProfile?.name?.[0] || 'U').toUpperCase()}
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Madurai Smart City</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
