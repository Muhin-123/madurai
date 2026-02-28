import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStats, useComplaints, useBins, useWards, useChartData, useWorkers } from '../../hooks/useFirebaseData';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  ClipboardList, Timer, CheckCircle, AlertTriangle,
  Trash2, Leaf, Users, ChevronRight, Activity, TrendingUp
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = (dark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#2D6A4F', font: { size: 10, weight: 'bold' } } },
    y: { grid: { color: 'rgba(45,106,79,0.05)' }, ticks: { color: '#2D6A4F', font: { size: 10 } } },
  },
});

function StatCard({ label, value, sub, icon: StatIcon, color, loading, delay = 0 }) {
  if (loading) return <SkeletonCard />;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (isNaN(end)) {
      setDisplayValue(value);
      return;
    }
    const timer = setInterval(() => {
      start += Math.ceil(end / 15);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, shadow: "0 10px 40px -10px rgba(27,67,50,0.1)" }}
      className="glass-card p-6 flex items-start justify-between group"
    >
      <div>
        <p className="text-[10px] font-black text-[#2D6A4F]/40 uppercase tracking-[0.2em] mb-3">{label}</p>
        <p className="text-3xl font-black text-[#1B4332] leading-none mb-2">{typeof value === 'string' ? value : displayValue}</p>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Activity size={10} className="text-[#2D6A4F]" />
          <p className="text-[10px] font-bold text-[#2D6A4F]/60 truncate">{sub}</p>
        </div>
      </div>
      <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#B7E4C7]/30 text-[#2D6A4F]">
        <StatIcon size={20} />
      </div>
    </motion.div>
  );
}

export default function OfficerDashboard() {
  const { stats, loading: statsLoading } = useStats();
  const { complaints, loading: cLoading } = useComplaints({ limitN: 6 });
  const { bins } = useBins();
  const { wards } = useWards();
  const { chartData, loading: chartLoading } = useChartData();

  const statCards = [
    { label: 'Today', value: stats.complaintsToday, icon: ClipboardList, sub: 'New entries' },
    { label: 'Pending', value: stats.pendingComplaints, icon: Timer, sub: 'Needs attention' },
    { label: 'Resolved', value: stats.resolvedToday, icon: CheckCircle, sub: 'Total today' },
    { label: 'Alerts', value: stats.criticalBins, icon: AlertTriangle, sub: 'Critical fill levels' },
    { label: 'Infrastructure', value: stats.toiletComplaints, icon: Trash2, sub: 'Facility reports' },
    { label: 'Bio-Waste', value: stats.bioWasteTraded + 'T', icon: Leaf, sub: 'Total yield' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="page-title text-4xl">City Command</h1>
          <p className="page-subtitle text-lg">Central hub for real-time civic intelligence.</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D6A4F] text-white font-bold text-sm shadow-xl shadow-[#2D6A4F]/20">
          <Activity size={16} /> Live Feed
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} loading={statsLoading} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 bg-white/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#1B4332]">City Performance</h2>
            <button className="text-xs font-bold text-[#2D6A4F] hover:underline">Download Report</button>
          </div>
          <div className="h-64">
            {chartLoading ? <div className="shimmer h-full w-full rounded-2xl" /> :
              <Line
                data={chartData?.weeklyTrend || { labels: [], datasets: [] }}
                options={{ ...CHART_OPTS(false), plugins: { legend: { display: true, labels: { color: '#2D6A4F', font: { size: 10, weight: 'bold' } } } } }}
              />}
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-black text-[#1B4332] mb-8">Asset Status</h2>
          <div className="h-64">
            {chartLoading ? <div className="shimmer h-full w-full rounded-2xl" /> :
              <Doughnut
                data={chartData?.complaintTypes || { labels: [], datasets: [] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#2D6A4F', font: { size: 10, weight: 'bold' } } } }, cutout: '75%' }}
              />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#1B4332]">Critical Tasks</h2>
            <Link to="/dashboard/complaints" className="text-xs font-bold text-[#2D6A4F] hover:underline">Manage All</Link>
          </div>
          <div className="space-y-4">
            {complaints.slice(0, 4).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#F8FAF5] transition-all border border-transparent hover:border-[#B7E4C7]/20">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-[#1B4332] truncate">{c.type}</p>
                    <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-widest">{c.ward_id}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#2D6A4F]/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 bg-[#1B4332] text-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Environmental Impact</h2>
            <TrendingUp size={24} className="text-[#B7E4C7]" />
          </div>
          <div className="space-y-6">
            {wards.slice(0, 3).map((ward, i) => (
              <div key={ward.id} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{ward.name || ward.id}</span>
                  <span className="text-[#B7E4C7]">{ward.score?.toFixed(0)} pts</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ward.score}%` }}
                    className="h-full bg-[#B7E4C7]"
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-10 w-full py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 transition-all font-bold text-sm shadow-2xl">
            View Analytics Report
          </button>
        </div>
      </div>
    </div>
  );
}
