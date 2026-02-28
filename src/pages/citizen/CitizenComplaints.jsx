import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Camera, X, CheckCircle2, Loader2, AlertCircle, Clock, MapPin,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useFirebaseData';
import { WARDS } from '../../data/mockData';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUS_BADGE = { Pending: 'badge-amber', 'In Progress': 'badge-amber', Resolved: 'badge-green' };
const COMPLAINT_TYPES = ['Garbage Overflow', 'Open Drain', 'Dead Animal', 'Street Cleaning', 'Blocked Drain', 'Illegal Dumping', 'Toilet Issue', 'Other'];

function ComplaintModal({ onClose }) {
  const { userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: '', ward_id: '', description: '', priority: 'Medium', photo: null });
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');

  const handleSubmit = async () => {
    if (!form.type || !form.ward_id) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (form.photo) {
        const fileRef = storageRef(storage, `complaints/${Date.now()}_${form.photo.name}`);
        await uploadBytes(fileRef, form.photo);
        photoUrl = await getDownloadURL(fileRef);
      }
      const docRef = await addDoc(collection(db, 'complaints'), {
        citizen_id: userProfile?.uid,
        type: form.type,
        ward_id: form.ward_id,
        description: form.description,
        priority: form.priority,
        photo_url: photoUrl,
        status: 'Pending',
        assigned_worker: null,
        bin_id: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      setTrackId(docRef.id.slice(0, 8).toUpperCase());
      setStep(4);
      toast.success('⭐ +5 points added to your account!');
    } catch {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">File Complaint</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {step < 4 && (
          <div className="flex gap-1 mb-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-civic-green to-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Select Issue Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {COMPLAINT_TYPES.map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`p-3 rounded-xl text-sm border text-left transition-all ${form.type === t ? 'border-civic-green bg-civic-green/10 text-civic-green dark:border-civic-green dark:bg-civic-green/10 dark:text-civic-green' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
            <select className="input-field" value={form.ward_id} onChange={(e) => setForm((f) => ({ ...f, ward_id: e.target.value }))}>
              <option value="">Select Ward *</option>
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <button onClick={() => setStep(2)} disabled={!form.type || !form.ward_id} className="btn-primary w-full disabled:opacity-50">Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Describe & Upload</h3>
            <textarea className="input-field resize-none" rows={3} placeholder="Describe the issue..." value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer ${form.photo ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20'}`}>
              <Camera className={`w-6 h-6 mb-1 ${form.photo ? 'text-civic-green' : 'text-gray-300'}`} />
              <span className="text-xs text-gray-400">{form.photo ? form.photo.name : 'Tap to upload photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) setForm((x) => ({ ...x, photo: f })); }} />
            </label>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Confirm & Submit</h3>
            <div className="glass-card p-4 space-y-2 text-sm">
              {[
                { label: 'Type', value: form.type },
                { label: 'Ward', value: form.ward_id },
                { label: 'Photo', value: form.photo ? '✓ Attached' : '✗ None' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-green-50 shadow-sm dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl text-xs text-green-700 dark:text-green-400 font-medium">
              ⭐ You'll earn +5 points for filing this complaint!
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '✓ Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <div className="w-20 h-20 rounded-full bg-civic-green/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-civic-green" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Complaint Filed!</h3>
            <p className="text-sm text-gray-400 mb-4">+5 points added to your account</p>
            <div className="glass-card p-4 mb-5 inline-block">
              <p className="text-xs text-gray-400 mb-1">Tracking ID</p>
              <p className="text-2xl font-mono font-bold text-civic-green dark:text-civic-green">{trackId}</p>
            </div>
            <button onClick={onClose} className="btn-primary block w-full">Close</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CitizenComplaints() {
  const { userProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const { complaints, loading } = useComplaints({ citizenId: userProfile?.uid });

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">Track your filed complaints · Real-time updates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> File Complaint
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['All', 'Pending', 'In Progress', 'Resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-civic-green dark:bg-civic-green text-white' : 'glass-card text-gray-600 dark:text-gray-400'}`}>
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
          title={filter === 'All' ? "No complaints yet" : `No ${filter} complaints`}
          description={filter === 'All' ? "File your first complaint to get started." : ""}
          actionLabel="File Complaint"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status === 'Resolved' ? 'bg-green-500/10' : c.status === 'In Progress' ? 'bg-amber-500/10' : 'bg-amber-500/10'
                  }`}>
                  {c.status === 'Resolved' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                    c.status === 'In Progress' ? <Clock className="w-5 h-5 text-amber-500" /> :
                      <AlertCircle className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.type}</p>
                    <span className={STATUS_BADGE[c.status] || 'badge-amber'}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ward_id || '—'}</span>
                    <span className="font-mono">{c.id.slice(0, 8)}</span>
                    <span>{c.created_at?.toDate?.()?.toLocaleDateString?.() || '—'}</span>
                  </div>
                  {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{c.description}</p>}

                  <div className="flex items-center gap-1.5 mt-3">
                    {['Filed', 'Assigned', 'In Progress', 'Resolved'].map((stage, idx) => {
                      const stageIdx = c.status === 'Pending' ? 1 : c.status === 'In Progress' ? 2 : 4;
                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx < stageIdx ? 'bg-civic-green text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            {idx + 1}
                          </div>
                          {idx < 3 && <div className={`flex-1 h-0.5 ${idx < stageIdx - 1 ? 'bg-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {c.photo_url && (
                <div className="mt-3">
                  <img src={c.photo_url} alt="complaint" className="w-full h-24 object-cover rounded-xl" />
                </div>
              )}
              {c.status === 'Resolved' && (
                <div className="mt-3 p-2.5 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolved! +10 points earned
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <ComplaintModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
