import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useComplaints, useBioWaste, useBins } from '../../hooks/useFirebaseData';
import { Link } from 'react-router-dom';
import { MessageSquareWarning, Leaf, Star, Trash2, QrCode, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import CameraQRScanner from '../../components/CameraQRScanner';

export default function CitizenDashboard() {
  const { userProfile } = useAuth();
  const { complaints, loading: cLoading } = useComplaints({ citizenId: userProfile?.uid, limitN: 5 });
  const { listings, loading: bLoading } = useBioWaste({ sellerId: userProfile?.uid, limitN: 3 });
  const { bins } = useBins();
  const [showQR, setShowQR] = useState(false);

  const myResolved = complaints.filter((c) => c.status === 'Resolved').length;
  const myPending = complaints.filter((c) => c.status === 'Pending').length;
  const criticalBins = bins.filter((b) => b.status === 'Critical').length;

  const STATUS_BADGE = { Pending: 'badge-amber', 'In Progress': 'badge-blue', Resolved: 'badge-green' };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Welcome, {userProfile?.name?.split(' ')[0] || 'Citizen'} 👋</h1>
        <p className="page-subtitle">Your civic dashboard · Making Madurai cleaner together</p>
      </div>

      <div className="glass-card p-5 mb-6 bg-gradient-to-r from-civic-blue/15 to-civic-green/15 border border-civic-blue/30 shadow-lg shadow-civic-blue/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Points</p>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-civic-green animate-spin-slow" />
              <span className="text-4xl font-black bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">
                {userProfile?.points || 0}
              </span>
              <span className="text-sm text-gray-400">pts</span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>+5 per complaint · +10 on resolve · +2/kg sold</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm"><span className="font-bold text-civic-green">{myResolved}</span> <span className="text-gray-400">resolved</span></div>
            <div className="text-sm"><span className="font-bold text-civic-blue">{myPending}</span> <span className="text-gray-400">pending</span></div>
            <div className="text-sm"><span className="font-bold text-civic-green">{listings.length}</span> <span className="text-gray-400">listings</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'My Complaints', value: complaints.length, icon: '📋', link: '/citizen/complaints', color: 'from-civic-blue via-orange-500 to-civic-green' },
          { label: 'My Listings', value: listings.length, icon: '🌿', link: '/citizen/bio-waste', color: 'from-civic-green to-yellow-400' },
          { label: 'Critical Bins', value: criticalBins, icon: '🗑️', link: null, color: 'from-alert-red to-orange-600' },
          { label: 'Points Earned', value: userProfile?.points || 0, icon: '⭐', link: null, color: 'from-civic-green to-yellow-500' },
        ].map(({ label, value, icon, link, color }) => {
          const card = (
            <div className="glass-card p-4 text-center hover:shadow-glow transition-all">
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          );
          return link ? (
            <Link key={label} to={link}>{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      <div className="flex gap-3 mb-6">
        <Link to="/citizen/complaints" className="btn-primary flex-1 flex items-center justify-center gap-2">
          <MessageSquareWarning className="w-4 h-4" /> File Complaint
        </Link>
        <Link to="/citizen/bio-waste" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4" /> Sell Waste
        </Link>
        <button onClick={() => setShowQR(!showQR)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${showQR ? 'bg-civic-blue text-white border-civic-blue' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
          <QrCode className="w-4 h-4" /> Scan QR
        </button>
      </div>

      <AnimatePresence>
        {showQR && <CameraQRScanner onClose={() => setShowQR(false)} onScan={() => setShowQR(false)} />}
      </AnimatePresence>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">My Recent Complaints</h2>
          <Link to="/citizen/complaints" className="text-xs text-civic-blue dark:text-civic-green font-medium hover:underline">View all →</Link>
        </div>
        {cLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-white/20 dark:bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareWarning className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No complaints yet. File your first complaint!</p>
            <Link to="/citizen/complaints" className="btn-primary mt-4 text-sm px-4 py-2 inline-flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4" /> File Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/30 dark:bg-white/5 rounded-xl"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  c.status === 'Resolved' ? 'bg-civic-green/10' : c.status === 'In Progress' ? 'bg-civic-blue/10' : 'bg-alert-amber/10'
                }`}>
                  {c.status === 'Resolved' ? <CheckCircle2 className="w-4 h-4 text-civic-green" /> :
                   c.status === 'In Progress' ? <Clock className="w-4 h-4 text-civic-blue" /> :
                   <AlertCircle className="w-4 h-4 text-alert-amber" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.type}</p>
                  <p className="text-xs text-gray-400">{c.ward_id} · {c.created_at?.toDate?.()?.toLocaleDateString?.() || '—'}</p>
                </div>
                <span className={STATUS_BADGE[c.status] || 'badge-amber'}>{c.status}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
