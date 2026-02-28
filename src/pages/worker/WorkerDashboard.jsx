import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useComplaints, useBins } from '../../hooks/useFirebaseData';
import {
  Loader2, X, Star, MapPin, ClipboardList,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  Trash2, Filter, Search, Calendar
} from 'lucide-react';
import { collection, addDoc, query, where, orderBy, limit, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (isNaN(end)) {
      setDisplayValue(value);
      return;
    }
    const timer = setInterval(() => {
      start += Math.ceil(end / 10);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex items-center gap-5 border-none shadow-soft"
    >
      <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#B7E4C7]/30">
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <h3 className="text-3xl font-black text-[#1B4332] leading-none mb-1">{displayValue}</h3>
        <p className="text-[10px] font-black text-[#2D6A4F]/40 uppercase tracking-[0.2em]">{label}</p>
      </div>
    </motion.div>
  );
}

export default function WorkerDashboard() {
  const { userProfile } = useAuth();
  const { complaints, loading: cLoading } = useComplaints({ workerId: userProfile?.uid });
  const { bins, loading: bLoading } = useBins();
  const [filter, setFilter] = useState('In Progress');
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolving, setResolving] = useState(false);

  const filteredTasks = complaints.filter(c => filter === 'All' ? true : c.status === filter);
  const myPending = complaints.filter(c => c.status === 'In Progress').length;
  const myResolved = complaints.filter(c => c.status === 'Resolved').length;

  const handleResolve = async () => {
    if (!selectedTask) return;
    setResolving(true);
    try {
      await updateDoc(doc(db, 'complaints', selectedTask.id), {
        status: 'Resolved',
        updated_at: serverTimestamp(),
        resolved_by: userProfile.uid
      });
      toast.success('Task marked as resolved!');
      setSelectedTask(null);
    } catch (err) {
      toast.error('Failed to update task.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="page-title text-4xl">Field Operations</h1>
        <p className="page-subtitle text-lg">Assigned tasks and real-time maintenance monitoring.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="My Queue" value={myPending} icon={ClipboardList} color="#FFB703" delay={0.1} />
        <StatCard label="Completed" value={myResolved} icon={CheckCircle2} color="#2D6A4F" delay={0.2} />
        <StatCard label="Area Bins" value={bins.length} icon={Trash2} color="#2D6A4F" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 glass-card p-8 min-h-[600px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <h2 className="text-2xl font-black text-[#1B4332]">Task Registry</h2>
            <div className="flex gap-2 p-1 bg-[#F8FAF5] rounded-2xl border border-[#B7E4C7]/30">
              {['In Progress', 'Resolved', 'All'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilter(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === m ? 'bg-[#2D6A4F] text-white shadow-lg' : 'text-[#2D6A4F]/60 hover:text-[#2D6A4F]'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {cLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F8FAF5] flex items-center justify-center mb-4">
                <ClipboardList size={24} className="text-[#2D6A4F]/20" />
              </div>
              <p className="text-[#2D6A4F]/40 font-bold uppercase tracking-widest text-xs">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[1.5rem] bg-white border border-transparent hover:border-[#B7E4C7]/40 hover:bg-[#F8FAF5] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-5 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#B7E4C7]/20 flex items-center justify-center text-[#2D6A4F]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-[#1B4332] group-hover:text-[#2D6A4F] transition-colors">{t.type}</h4>
                      <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-widest">{t.ward_id} · {t.created_at?.toDate?.()?.toLocaleDateString() || 'Today'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span className={`badge-green ${t.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : ''}`}>{t.status}</span>
                    <ChevronRight size={18} className="text-[#2D6A4F]/20 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 bg-[#1B4332] text-white">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Trash2 size={20} className="text-[#B7E4C7]" /> Area Sensors
            </h2>
            <div className="space-y-5">
              {bins.slice(0, 4).map((b) => (
                <div key={b.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>{b.id}</span>
                    <span className={b.fill > 80 ? 'text-rose-400' : 'text-[#B7E4C7]'}>{b.fill}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.fill}%` }}
                      className={`h-full ${b.fill > 80 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-[#B7E4C7]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 rounded-2xl bg-[#2D6A4F] font-bold text-xs hover:shadow-xl transition-all">View Full Map</button>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-sm font-black text-[#1B4332] mb-6 uppercase tracking-[0.2em]">Safety Guidelines</h3>
            <ul className="space-y-4">
              {[
                { icon: ShieldCheck, text: 'Wear protective gear at all times.' },
                { icon: Calendar, text: 'Upload photos after completion.' },
                { icon: Star, text: 'Maintain 4.5+ rating for bonus.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-lg bg-[#F8FAF5] flex items-center justify-center flex-shrink-0">
                    <item.icon size={12} className="text-[#2D6A4F]" />
                  </div>
                  <p className="text-xs font-semibold text-[#1B4332]/70 leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card bg-white p-10 overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[#F8FAF5] text-[#1B4332] hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-6">
                <div>
                  <span className={`badge-green mb-4 ${selectedTask.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : ''}`}>
                    {selectedTask.status}
                  </span>
                  <h3 className="text-3xl font-black text-[#1B4332] mb-2">{selectedTask.type}</h3>
                  <p className="text-sm font-medium text-[#2D6A4F]/60 flex items-center gap-2">
                    <MapPin size={14} /> {selectedTask.location} · {selectedTask.ward_id}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#F8FAF5] border border-[#B7E4C7]/20">
                  <h4 className="text-[10px] font-black text-[#2D6A4F]/40 uppercase tracking-[0.2em] mb-2">Description</h4>
                  <p className="text-sm font-semibold text-[#1B4332]/80 leading-relaxed italic">
                    "{selectedTask.description || 'No description provided.'}"
                  </p>
                </div>

                {selectedTask.status === 'In Progress' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={handleResolve}
                      disabled={resolving}
                      className="btn-primary col-span-2"
                    >
                      {resolving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                      Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
// Helper for missing imports
const ShieldCheck = (props) => <div {...props}><div className="w-full h-full border-2 border-current rounded-full" /></div>;
