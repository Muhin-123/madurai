import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useComplaints, useBioWaste, useBins } from '../../hooks/useFirebaseData';
import { Link } from 'react-router-dom';
import {
  MessageSquareWarning, Leaf, Star, QrCode,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  MapPin, ShieldCheck, ChevronRight, ClipboardList
} from 'lucide-react';
import CameraQRScanner from '../../components/CameraQRScanner';

function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (isNaN(end)) {
      setDisplayValue(value);
      return;
    }
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    let timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#B7E4C7]/30">
          <Icon size={20} style={{ color }} />
        </div>
        <ChevronRight size={14} className="text-[#2D6A4F]/20" />
      </div>
      <h3 className="text-3xl font-black text-[#1B4332]">{displayValue}{typeof value === 'string' && value.includes('%') ? '%' : ''}</h3>
      <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

export default function CitizenDashboard() {
  const { userProfile } = useAuth();
  const { complaints, loading: cLoading } = useComplaints({ citizenId: userProfile?.uid, limitN: 5 });
  const { listings } = useBioWaste({ sellerId: userProfile?.uid, limitN: 3 });
  const { bins } = useBins();
  const [showScanner, setShowScanner] = useState(false);

  const myResolved = complaints.filter((c) => c.status === 'Resolved').length;
  const criticalBins = bins.filter((b) => b.status === 'Critical').length;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="page-title text-4xl">Citizen Hub</h1>
        <p className="page-subtitle text-lg">Your impact on Madurai's future starts here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Resolved Issues" value={myResolved} icon={CheckCircle2} color="#2D6A4F" delay={0.1} />
        <StatCard label="Waste Listings" value={listings.length} icon={Leaf} color="#52B788" delay={0.2} />
        <StatCard label="Active Points" value={userProfile?.points || 0} icon={Star} color="#FFB703" delay={0.3} />
        <StatCard label="Critical Bins" value={criticalBins} icon={AlertCircle} color="#E5383B" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-8 bg-white/40">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-[#1B4332]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <Link to="/dashboard/citizen/complaints" className="btn-primary py-6">
                <MessageSquareWarning size={20} /> File Complaint
              </Link>
              <Link to="/dashboard/citizen/bio-waste" className="btn-secondary py-6">
                <Leaf size={20} /> Sell Waste
              </Link>
              <button
                onClick={() => setShowScanner(true)}
                className="btn-secondary py-6 bg-white"
              >
                <QrCode size={20} /> Scan Bin
              </button>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-black text-[#1B4332] mb-8">Recent Activity</h2>
            {cLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 shimmer rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#F8FAF5] border border-transparent hover:border-[#B7E4C7]/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#B7E4C7]/20 flex items-center justify-center text-[#2D6A4F]">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B4332]">{c.type}</p>
                        <p className="text-xs text-[#2D6A4F]/60 flex items-center gap-2">
                          <MapPin size={10} /> {c.ward_id} · <Clock size={10} /> {c.created_at?.toDate?.()?.toLocaleDateString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                    <span className={`badge-green ${c.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 bg-[#1B4332] text-white">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
              <TrendingUp size={32} className="text-[#B7E4C7]" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Environmental Impact</h3>
              <p className="text-sm text-white/60 font-medium px-4">Your contributions have saved 12.4kg of organic waste from landfills this month.</p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-[#B7E4C7]"
              />
            </div>
            <p className="text-[10px] font-bold text-[#B7E4C7] uppercase tracking-[0.2em]">65% OF MONTHLY GOAL</p>
            <button className="mt-4 w-full py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-all font-bold text-sm">View Detailed Impact</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <div className="relative w-full max-w-lg">
              <CameraQRScanner
                onClose={() => setShowScanner(false)}
                onScan={(bin) => {
                  console.log('Scanned bin:', bin);
                  // Possible follow up: navigate to report issue for this bin
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
