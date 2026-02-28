import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquareWarning, Trash2, Leaf, Trophy } from 'lucide-react';

const mobileNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { path: '/smart-bins', icon: Trash2, label: 'Bins' },
  { path: '/bio-waste', icon: Leaf, label: 'Bio-Waste' },
  { path: '/ward-ranking', icon: Trophy, label: 'Ranking' },
];

export default function MobileNav({ pathname }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-navy-900/95 backdrop-blur-xl border-t border-white/20 dark:border-white/10 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <NavLink key={path} to={path} className="flex flex-col items-center flex-1">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all
                  ${isActive ? 'text-civic-blue dark:text-civic-green' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-civic-blue/10 dark:bg-civic-green/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <motion.div layoutId="mobile-indicator" className="w-1 h-1 rounded-full bg-civic-blue dark:bg-civic-green" />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
