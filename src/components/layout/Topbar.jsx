import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Sun, Moon, ChevronDown, LogOut,
  User, Cloud, Wind, Droplets, CheckCheck, Settings, Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useFirebaseData';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WEATHER = { temp: 32, humidity: 68, wind: 14, condition: 'Partly Cloudy' };

const ROLE_LABELS = {
  officer: '🏛 Officer',
  citizen: '👤 Citizen',
  worker: '🔧 Worker',
};

export default function Topbar({ pageName }) {
  const { darkMode, toggleDarkMode, toggleSidebar } = useApp();
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const { notifications, unreadCount, markAllRead } = useNotifications(
    userProfile?.uid,
    userProfile?.role
  );

  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const notifTypeColors = { alert: 'bg-alert-red', info: 'bg-civic-green', success: 'bg-civic-green' };
  const userName = userProfile?.name || 'User';
  const userRole = userProfile?.role || 'citizen';

  return (
    <header className="sticky top-0 z-20 h-16 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-civic-green/10 text-gray-500 dark:text-gray-400 hover:text-civic-green dark:hover:text-white transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{pageName}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">{format(time, 'EEEE, dd MMMM yyyy')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden md:flex items-center gap-3 px-3 py-2 glass-card rounded-xl text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-civic-green dark:text-civic-green" />
            <span className="font-semibold">{WEATHER.temp}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-green-400" />
            <span>{WEATHER.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-gray-400" />
            <span>{WEATHER.wind} km/h</span>
          </div>
          <span className="text-gray-400">Madurai</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-3 py-2 glass-card rounded-xl text-xs font-mono text-civic-green dark:text-civic-green font-semibold">
          {format(time, 'HH:mm:ss')}
        </div>

        {userProfile?.role === 'citizen' && (
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-civic-green/10 text-civic-green text-xs font-semibold">
            <Star className="w-3.5 h-3.5" />
            <span>{userProfile.points || 0} pts</span>
          </div>
        )}

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-civic-green/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all"
        >
          <motion.div
            initial={false}
            animate={{ rotate: darkMode ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? <Sun className="w-5 h-5 text-lime-400" /> : <Moon className="w-5 h-5" />}
          </motion.div>
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 rounded-xl hover:bg-civic-green/10 text-gray-500 dark:text-gray-400 hover:text-civic-green dark:hover:text-white transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-alert-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-80 glass-card rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h3>
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-civic-green dark:text-civic-green hover:underline">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors border-b border-white/5 ${!n.read ? 'bg-civic-green/5 dark:bg-civic-green/5' : ''}`}>
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notifTypeColors[n.type] || 'bg-gray-400'} ${!n.read ? 'animate-pulse' : 'opacity-30'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-tight">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-civic-green/10 dark:hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-civic-green to-civic-green flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{ROLE_LABELS[userRole] || userRole}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-56 glass-card rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-400">{userProfile?.email}</p>
                  <span className="text-[10px] font-medium mt-1.5 inline-flex px-2 py-0.5 rounded-full bg-civic-green/10 text-civic-green dark:bg-civic-green/10 dark:text-civic-green">
                    {ROLE_LABELS[userRole] || userRole}
                  </span>
                  {userRole === 'citizen' && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-civic-green font-semibold">
                      <Star className="w-3 h-3" /> {userProfile?.points || 0} points earned
                    </div>
                  )}
                </div>
                {[
                  { icon: User, label: 'Profile', action: () => navigate('/settings') },
                  { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                  { icon: LogOut, label: 'Sign Out', danger: true, action: handleSignOut },
                ].map(({ icon: Icon, label, danger, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/20 dark:hover:bg-white/5
                      ${danger ? 'text-alert-red' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
