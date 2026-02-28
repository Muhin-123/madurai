import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { mockWardRankings } from '../data/mockData';

const CONFETTI_COLORS = ['#FF8C00', '#FFD700', '#FFED4E', '#E53935', '#E67E22', '#FF6B6B'];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function PodiumCard({ ward, pos }) {
  const configs = {
    1: { height: 'h-32', bg: 'from-yellow-400 to-amber-600', icon: <Trophy className="w-8 h-8 text-white" />, label: '1st', shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]' },
    2: { height: 'h-24', bg: 'from-gray-300 to-slate-500', icon: <Medal className="w-7 h-7 text-white" />, label: '2nd', shadow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]' },
    3: { height: 'h-20', bg: 'from-amber-600 to-orange-800', icon: <Award className="w-6 h-6 text-white" />, label: '3rd', shadow: 'shadow-[0_0_20px_rgba(180,83,9,0.4)]' },
  };
  const cfg = configs[pos];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: pos * 0.15, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-2"
    >
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center ${cfg.shadow}`}>
        {cfg.icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800 dark:text-white">{ward.ward}</p>
        <p className="text-2xl font-black text-gradient">{ward.score}</p>
        <p className="text-[10px] text-gray-400">score</p>
      </div>
      <div className={`w-full ${cfg.height} bg-gradient-to-b ${cfg.bg} rounded-t-xl flex items-end justify-center pb-2`}>
        <span className="text-white font-black text-lg">{cfg.label}</span>
      </div>
    </motion.div>
  );
}

export default function WardRanking() {
  const [confetti, setConfetti] = useState(true);
  useEffect(() => { const t = setTimeout(() => setConfetti(false), 5000); return () => clearTimeout(t); }, []);

  const top3 = [mockWardRankings[1], mockWardRankings[0], mockWardRankings[2]];

  const ChangeIcon = ({ change }) => {
    if (change === 'up') return <TrendingUp className="w-4 h-4 text-civic-green" />;
    if (change === 'down') return <TrendingDown className="w-4 h-4 text-alert-red" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Ward Ranking & Leaderboard</h1>
        <p className="page-subtitle">Cleanest wards ranked by performance score · Updated daily at 6 AM</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Wards', value: 15, color: 'from-civic-blue to-blue-600' },
          { label: 'Avg Score', value: '85.6', color: 'from-civic-green to-emerald-600' },
          { label: 'Top Performer', value: 'Anna Nagar', color: 'from-amber-400 to-amber-600', text: true },
        ].map(({ label, value, color, text }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`${text ? 'text-lg' : 'text-3xl'} font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        {confetti && <Confetti />}
        <h2 className="section-title text-center mb-6">🏆 Top 3 Cleanest Wards</h2>
        <div className="grid grid-cols-3 gap-4 items-end">
          {top3.map((ward, i) => <PodiumCard key={ward.ward} ward={ward} pos={i === 0 ? 2 : i === 1 ? 1 : 3} />)}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="section-title">Full Rankings</h2>
        </div>
        <div className="divide-y divide-white/5">
          {mockWardRankings.map((ward, i) => (
            <motion.div
              key={ward.ward}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg
                ${ward.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg' :
                  ward.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-slate-500 text-white shadow-lg' :
                  ward.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-800 text-white shadow-lg' :
                  'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 text-base'}`}>
                {ward.rank <= 3 ? (ward.rank === 1 ? '🥇' : ward.rank === 2 ? '🥈' : '🥉') : `#${ward.rank}`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">{ward.ward}</span>
                  <ChangeIcon change={ward.change} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{ward.complaints} complaints</span>
                  <span>Cleanliness: {ward.cleanliness}%</span>
                  <span>Response: {ward.response}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ward.score}%` }}
                    transition={{ duration: 1.2, delay: i * 0.07 + 0.3 }}
                    className={`h-full rounded-full ${
                      ward.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                      ward.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-slate-500' :
                      ward.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
                      'bg-gradient-to-r from-civic-blue to-civic-green'
                    }`}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl font-black text-gray-800 dark:text-white">{ward.score}</div>
                <div className="text-[10px] text-gray-400">/ 100</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
