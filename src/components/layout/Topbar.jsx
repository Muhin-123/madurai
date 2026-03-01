import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, ChevronDown, User, Settings,
  LogOut, Star, Shield, BadgeCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_BADGE = {
  citizen: { label: 'Citizen Portal', color: 'bg-[#2D6A4F]/10 text-[#2D6A4F]', icon: BadgeCheck },
  worker: { label: 'Worker Portal', color: 'bg-[#1D3557]/10 text-[#1D3557]', icon: Shield },
  officer: { label: 'Officer Panel', color: 'bg-[#6A040F]/10 text-[#6A040F]', icon: Shield },
};

export default function Topbar() {
  const { toggleSidebar } = useApp();
  // CRITICAL FIX: use userRole (string), not userProfile?.role (was undefined)
  const { userProfile, userRole, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const role = userRole || 'citizen';
  const badge = ROLE_BADGE[role] || ROLE_BADGE.citizen;
  const firstName = userProfile?.name?.split(' ')[0] || 'User';

  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-2xl bg-white border border-[#B7E4C7]/30 text-[#1B4332] shadow-soft lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1B4332] tracking-tight">Welcome, {firstName}</h2>
          <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-widest">Madurai Civic Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Points for Citizen */}
        {role === 'citizen' && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#B7E4C7]/20 border border-[#B7E4C7]/30">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-[#1B4332]">{userProfile?.points || 0} pts</span>
          </div>
        )}

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs ${badge.color}`}
        >
          <badge.icon size={12} />
          <span className="tracking-tight">{badge.label}</span>
        </motion.div>

        {/* Notifications */}
        <button className="p-2.5 rounded-2xl bg-white border border-[#B7E4C7]/30 text-[#1B4332] shadow-soft relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 lg:pl-3 lg:pr-1 rounded-full bg-white border border-[#B7E4C7]/30 shadow-soft hover:shadow-md transition-all"
          >
            <span className="hidden lg:block text-xs font-bold text-[#1B4332]">{firstName}</span>
            <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-[#B7E4C7] text-xs font-black">
              {firstName[0].toUpperCase()}
            </div>
            <ChevronDown size={14} className={`text-[#2D6A4F] transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] border border-[#B7E4C7]/30 shadow-2xl p-3 overflow-hidden"
              >
                <button
                  onClick={() => { setShowProfile(false); navigate('/dashboard/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1B4332] hover:bg-[#F8FAF5] rounded-xl transition-all"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => { setShowProfile(false); navigate('/dashboard/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1B4332] hover:bg-[#F8FAF5] rounded-xl transition-all"
                >
                  <Settings size={16} /> Settings
                </button>
                <div className="my-2 h-px bg-[#B7E4C7]/20 mx-3" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
