import { motion } from 'framer-motion';
import { useStats, useComplaints, useBins, useWards, useChartData, useWorkers } from '../../hooks/useFirebaseData';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
  },
};

const DOUGHNUT_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } },
  cutout: '65%',
};

const LINE_OPTS = {
  ...CHART_OPTS,
  plugins: {
    legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } },
  },
};

function StatCard({ label, value, sub, icon, gradient, loading }) {
  if (loading) return <SkeletonCard />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{icon}</div>
        </div>
        <p className="text-3xl font-black text-gray-800 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function OfficerDashboard() {
  const { stats, loading: statsLoading } = useStats();
  const { complaints, loading: cLoading } = useComplaints({ limitN: 5 });
  const { bins } = useBins();
  const { wards } = useWards();
  const { chartData, loading: chartLoading } = useChartData();
  const { workers } = useWorkers();

  const statCards = [
    { label: 'Complaints Today', value: stats.complaintsToday, icon: '📋', gradient: 'from-civic-blue to-blue-600', sub: 'Filed today' },
    { label: 'Pending', value: stats.pendingComplaints, icon: '⏳', gradient: 'from-alert-amber to-orange-500', sub: 'Needs action' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: '✅', gradient: 'from-civic-green to-emerald-500', sub: 'Completed' },
    { label: 'Critical Bins', value: stats.criticalBins, icon: '🗑️', gradient: 'from-alert-red to-red-600', sub: 'Fill > 80%' },
    { label: 'Toilet Issues', value: stats.toiletComplaints, icon: '🚻', gradient: 'from-alert-purple to-purple-600', sub: 'Today' },
    { label: 'Bio-Waste (kg)', value: stats.bioWasteTraded, icon: '🌿', gradient: 'from-civic-green to-teal-500', sub: 'Total traded' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Officer Command Centre</h1>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-civic-green animate-pulse" />
          <p className="page-subtitle mb-0">Real-time civic intelligence · {workers.length} workers · {bins.length} bins</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={statsLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <div className="glass-card p-5 xl:col-span-1">
          <h3 className="section-title mb-4">Weekly Trend</h3>
          <div className="h-48">
            {chartLoading ? (
              <div className="h-full animate-pulse bg-white/20 dark:bg-white/5 rounded-xl" />
            ) : chartData?.weeklyTrend ? (
              <Line data={chartData.weeklyTrend} options={LINE_OPTS} />
            ) : null}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Complaints by Ward</h3>
          <div className="h-48">
            {chartLoading ? (
              <div className="h-full animate-pulse bg-white/20 dark:bg-white/5 rounded-xl" />
            ) : chartData?.wardComplaints ? (
              <Bar data={chartData.wardComplaints} options={CHART_OPTS} />
            ) : null}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Issue Types</h3>
          <div className="h-48">
            {chartLoading ? (
              <div className="h-full animate-pulse bg-white/20 dark:bg-white/5 rounded-xl" />
            ) : chartData?.complaintTypes ? (
              <Doughnut data={chartData.complaintTypes} options={DOUGHNUT_OPTS} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Recent Complaints</h3>
          {cLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-white/20 dark:bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No complaints yet</p>
          ) : (
            <div className="space-y-2">
              {complaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{c.type}</p>
                    <p className="text-xs text-gray-400">{c.ward_id || '—'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.status === 'Resolved' ? 'badge-green' : c.status === 'In Progress' ? 'badge-blue' : 'badge-amber'
                  }`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Top Ward Rankings</h3>
          {wards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No ward data yet</p>
          ) : (
            <div className="space-y-2">
              {wards.slice(0, 5).map((ward, i) => (
                <div key={ward.id} className="flex items-center gap-3 p-3 bg-white/30 dark:bg-white/5 rounded-xl">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{ward.name || ward.id}</p>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-civic-blue to-civic-green"
                        style={{ width: `${ward.score || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-civic-blue dark:text-civic-green">{ward.score?.toFixed?.(0) || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
