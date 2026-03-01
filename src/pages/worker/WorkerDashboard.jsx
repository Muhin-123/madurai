import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle,
  MapPin, ChevronRight, X, Loader2, ThumbsDown, Play,
  CheckSquare, Trash2
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, orderBy,
  updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#F48C06',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-200',
    glow: 'shadow-orange-100',
  },
  accepted: {
    label: 'Accepted',
    color: '#457B9D',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200',
    glow: 'shadow-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    color: '#2D6A4F',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    glow: 'shadow-emerald-100',
  },
  completed: {
    label: 'Completed',
    color: '#52B788',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-200',
    glow: 'shadow-green-100',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </motion.span>
  );
}

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const timer = setInterval(() => {
      start += Math.ceil(end / 15);
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 50);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function StatCard({ label, value, icon: Icon, iconColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white border border-[#457B9D]/15 shadow-sm p-6 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-3xl font-black text-[#1D3557]"><AnimatedCounter value={value} /></p>
        <p className="text-[10px] font-bold text-[#457B9D]/60 uppercase tracking-[0.18em]">{label}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onSelect, delay = 0 }) {
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={() => onSelect(task)}
      className={`group flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#1D3557]/8 hover:border-[#457B9D]/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${cfg.glow}`}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${cfg.color}18` }}>
        <MapPin size={18} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1D3557] text-sm truncate group-hover:text-[#457B9D] transition-colors">
          {task.description || task.type || 'Complaint'}
        </p>
        <p className="text-[10px] font-semibold text-[#457B9D]/50 uppercase tracking-wide truncate">
          {task.location || task.ward_id || 'No location'} · {task.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={task.status} />
        <ChevronRight size={16} className="text-[#457B9D]/30 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function TaskModal({ task, onClose }) {
  const [actionLoading, setActionLoading] = useState(null);
  const { currentUser } = useAuth();

  const updateStatus = async (newStatus, extraFields = {}) => {
    setActionLoading(newStatus);
    try {
      await updateDoc(doc(db, 'complaints', task.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...extraFields,
      });
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}"!`);
      onClose();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update task. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading('decline');
    try {
      await updateDoc(doc(db, 'complaints', task.id), {
        status: 'pending',
        assignedWorkerId: null,
        updatedAt: serverTimestamp(),
      });
      toast.success('Task declined and returned to pool.');
      onClose();
    } catch (err) {
      toast.error('Failed to decline task.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
      >
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#1D3557] to-[#457B9D]" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          <X size={18} />
        </button>

        <div className="space-y-5 mt-2">
          <StatusBadge status={task.status} />

          <div>
            <h3 className="text-2xl font-black text-[#1D3557] mb-1">
              {task.description || task.type || 'Complaint'}
            </h3>
            <p className="text-sm text-[#457B9D]/70 flex items-center gap-2">
              <MapPin size={13} />
              {task.location || task.ward_id || 'Location not specified'}
            </p>
          </div>

          <div className="bg-[#F4F7F3] rounded-2xl p-4">
            <p className="text-[10px] font-black text-[#1D3557]/40 uppercase tracking-[0.2em] mb-1">Details</p>
            <p className="text-sm text-[#1D3557]/80 leading-relaxed">
              {task.description || 'No additional details provided.'}
            </p>
          </div>

          {/* Action buttons based on current status */}
          <div className="space-y-3 pt-2">
            {task.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateStatus('accepted')}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1D3557] text-white font-bold text-sm hover:bg-[#1D3557]/85 transition-all disabled:opacity-60"
                >
                  {actionLoading === 'accepted'
                    ? <Loader2 size={16} className="animate-spin" />
                    : <CheckCircle2 size={16} />}
                  Accept
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDecline}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all border border-red-100 disabled:opacity-60"
                >
                  {actionLoading === 'decline'
                    ? <Loader2 size={16} className="animate-spin" />
                    : <ThumbsDown size={16} />}
                  Decline
                </motion.button>
              </div>
            )}

            {task.status === 'accepted' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateStatus('in_progress')}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#457B9D] text-white font-bold text-sm hover:bg-[#457B9D]/85 transition-all disabled:opacity-60"
              >
                {actionLoading === 'in_progress'
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Play size={16} />}
                Mark In Progress
              </motion.button>
            )}

            {task.status === 'in_progress' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateStatus('completed')}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2D6A4F] text-white font-bold text-sm hover:bg-[#2D6A4F]/85 transition-all disabled:opacity-60"
              >
                {actionLoading === 'completed'
                  ? <Loader2 size={16} className="animate-spin" />
                  : <CheckSquare size={16} />}
                Mark as Completed ✓
              </motion.button>
            )}

            {task.status === 'completed' && (
              <div className="text-center py-3 text-green-700 font-bold text-sm bg-green-50 rounded-2xl border border-green-100">
                ✓ Task completed
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Worker Dashboard ─────────────────────────────────────────────────

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'complaints'),
      where('assignedWorkerId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setAllTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('WorkerDashboard complaints error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const assigned = allTasks.filter(t => t.status === 'pending');
  const active = allTasks.filter(t => t.status === 'accepted' || t.status === 'in_progress');
  const completed = allTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-bold text-[#457B9D]/60 uppercase tracking-[0.25em] mb-1">Field Operations</p>
          <h1 className="text-4xl font-black text-[#1D3557] tracking-tight">My Tasks</h1>
          <p className="text-[#457B9D]/70 font-medium mt-1">Manage your assigned civic complaints</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1D3557] text-white font-bold text-sm shadow-lg shadow-[#1D3557]/20">
          <ClipboardList size={15} />
          {allTasks.length} Total Tasks
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Assigned" value={assigned.length} icon={AlertCircle} iconColor="#F48C06" delay={0.05} />
        <StatCard label="In Progress" value={active.length} icon={Clock} iconColor="#457B9D" delay={0.1} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} iconColor="#2D6A4F" delay={0.15} />
      </div>

      {/* Section 1 – Assigned Tasks */}
      <section className="bg-white rounded-3xl border border-[#1D3557]/8 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#1D3557]/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertCircle size={18} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">Assigned Tasks</h2>
          </div>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            {assigned.length} pending
          </span>
        </div>
        <div className="p-6 space-y-3">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
            ))
          ) : assigned.length === 0 ? (
            <div className="text-center py-12 text-[#457B9D]/40">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No pending tasks</p>
            </div>
          ) : (
            <AnimatePresence>
              {assigned.map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Section 2 – Active Tasks */}
      <section className="bg-white rounded-3xl border border-[#457B9D]/15 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#457B9D]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-[#457B9D]" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">Active Tasks</h2>
          </div>
          <span className="text-xs font-bold text-[#457B9D] bg-blue-50 px-3 py-1 rounded-full">
            {active.length} in progress
          </span>
        </div>
        <div className="p-6 space-y-3">
          {active.length === 0 ? (
            <div className="text-center py-10 text-[#457B9D]/40">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No active tasks</p>
            </div>
          ) : (
            <AnimatePresence>
              {active.map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Section 3 – Completed Tasks */}
      <section className="bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-green-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">Completed Tasks</h2>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {completed.length} done
          </span>
        </div>
        <div className="p-6 space-y-3">
          {completed.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No completed tasks yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {completed.slice(0, 5).map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.03} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Task modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
