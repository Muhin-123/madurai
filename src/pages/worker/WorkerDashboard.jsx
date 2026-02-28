import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Camera, Loader2, X, Star, MapPin } from 'lucide-react';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useFirebaseData';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUS_BADGE = { Pending: 'badge-amber', 'In Progress': 'badge-amber', Resolved: 'badge-green' };
const PRIORITY_BADGE = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-green' };

function ResolveModal({ complaint, onClose }) {
  const [photos, setPhotos] = useState({ before: null, after: null });
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (file) setPhotos((p) => ({ ...p, [field]: file }));
  };

  const uploadAndResolve = async () => {
    setSubmitting(true);
    try {
      const urls = {};
      for (const [key, file] of Object.entries(photos)) {
        if (file) {
          const fileRef = storageRef(storage, `resolutions/${complaint.id}/${key}_${Date.now()}`);
          await uploadBytes(fileRef, file);
          urls[key] = await getDownloadURL(fileRef);
        }
      }
      await updateDoc(doc(db, 'complaints', complaint.id), {
        status: 'Resolved',
        proof_before: urls.before || null,
        proof_after: urls.after || null,
        updated_at: serverTimestamp(),
        resolved_at: serverTimestamp(),
      });
      toast.success('✓ Marked as resolved! +10 points earned.');
      onClose();
    } catch {
      toast.error('Failed to resolve complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white">Mark as Resolved</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload proof photos to complete this task</p>
        <div className="space-y-3 mb-4">
          {[
            { key: 'before', label: 'Before Photo' },
            { key: 'after', label: 'After Photo (Required)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
              <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${photos[key] ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20 hover:border-civic-green'}`}>
                <Camera className={`w-5 h-5 flex-shrink-0 ${photos[key] ? 'text-civic-green' : 'text-gray-300'}`} />
                <span className="text-xs text-gray-400 truncate">{photos[key] ? photos[key].name : 'Click to upload'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile(key)} />
              </label>
            </div>
          ))}
        </div>
        <div className="p-3 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green font-medium mb-4">
          ⭐ You'll earn +10 points for resolving this complaint
        </div>
        <button onClick={uploadAndResolve} disabled={!photos.after || submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="w-4 h-4" /> Mark Resolved</>}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function WorkerDashboard() {
  const { userProfile } = useAuth();
  const { complaints, loading } = useComplaints({ workerId: userProfile?.uid });
  const [resolveTarget, setResolveTarget] = useState(null);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const pending = complaints.filter((c) => c.status !== 'Resolved').length;
  const rate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">My Tasks</h1>
        <p className="page-subtitle">Assigned complaints · Real-time from Firestore</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Assigned', value: complaints.length, icon: '📋', color: 'from-green-600 to-green-500' },
          { label: 'Pending', value: pending, icon: '⏳', color: 'from-lime-400 to-green-600' },
          { label: 'Resolved', value: resolved, icon: '✅', color: 'from-civic-green to-lime-500' },
          { label: 'My Points', value: userProfile?.points || 0, icon: '⭐', color: 'from-lime-400 to-civic-green' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resolution Rate</span>
          <span className={`text-sm font-bold ${rate >= 80 ? 'text-lime-400' : rate >= 50 ? 'text-green-400' : 'text-alert-red'}`}>{rate}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${rate >= 80 ? 'bg-lime-400' : rate >= 50 ? 'bg-green-400' : 'bg-alert-red'}`}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Star className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-xs text-gray-400">{userProfile?.points || 0} total points earned</span>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['All', 'Pending', 'In Progress', 'Resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-civic-green text-white shadow-glow' : 'glass-card text-gray-600 dark:text-gray-400'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'All' ? "No tasks assigned yet" : `No ${filter} tasks`}
          description={filter === 'All' ? "Your officer will assign complaints to you soon." : ""}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.priority === 'High' ? 'bg-alert-red/10' : c.priority === 'Medium' ? 'bg-amber-500/10' : 'bg-green-500/10'
                  }`}>
                  {c.status === 'Resolved' ? <CheckCircle2 className={`w-5 h-5 text-civic-green`} /> :
                    c.priority === 'High' ? <AlertCircle className="w-5 h-5 text-alert-red" /> :
                      c.priority === 'Medium' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : <AlertCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={STATUS_BADGE[c.status] || 'badge-blue'}>{c.status}</span>
                    <span className={PRIORITY_BADGE[c.priority] || 'badge-blue'}>{c.priority}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{c.type}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ward_id || '—'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.created_at?.toDate?.()?.toLocaleDateString?.() || '—'}</span>
                  </div>
                  {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
                </div>
              </div>

              {c.photo_url && (
                <div className="mt-3">
                  <img src={c.photo_url} alt="issue" className="w-full h-24 object-cover rounded-xl" />
                </div>
              )}

              {c.status !== 'Resolved' && (
                <button
                  onClick={() => setResolveTarget(c)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-civic-green text-white text-sm font-semibold hover:bg-civic-green/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                </button>
              )}

              {c.status === 'Resolved' && (
                <div className="mt-3 p-2.5 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolved · +10 points earned
                </div>
              )}

              {(c.proof_before || c.proof_after) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {c.proof_before && (
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Before</p>
                      <img src={c.proof_before} alt="before" className="w-full h-16 object-cover rounded-lg" />
                    </div>
                  )}
                  {c.proof_after && (
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">After</p>
                      <img src={c.proof_after} alt="after" className="w-full h-16 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {resolveTarget && (
          <ResolveModal complaint={resolveTarget} onClose={() => setResolveTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
