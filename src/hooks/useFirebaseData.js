import { useState, useEffect, useMemo } from 'react';
import { db, rtdb } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

export function useStats() {
  const [stats, setStats] = useState({
    complaintsToday: 0,
    pendingComplaints: 0,
    resolvedToday: 0,
    criticalBins: 0,
    toiletComplaints: 0,
    bioWasteTraded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStart();

    const unsubToday = onSnapshot(
      query(collection(db, 'complaints'), where('created_at', '>=', today)),
      (snap) => {
        const data = snap.docs.map((d) => d.data());
        setStats((prev) => ({
          ...prev,
          complaintsToday: data.length,
          resolvedToday: data.filter((c) => c.status === 'Resolved').length,
          toiletComplaints: data.filter((c) => c.type === 'Toilet Issue').length,
        }));
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubPending = onSnapshot(
      query(collection(db, 'complaints'), where('status', '==', 'Pending')),
      (snap) => setStats((prev) => ({ ...prev, pendingComplaints: snap.size })),
      () => {}
    );

    const unsubBio = onSnapshot(
      query(collection(db, 'bio_waste_market'), where('status', '==', 'sold')),
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + (d.data().weight_kg || 0), 0);
        setStats((prev) => ({ ...prev, bioWasteTraded: total }));
      },
      () => {}
    );

    const binsRef = ref(rtdb, 'smart_bins');
    const unsubBins = onValue(
      binsRef,
      (snap) => {
        const data = snap.val() || {};
        const critical = Object.values(data).filter((b) => (b.fill || 0) > 80).length;
        setStats((prev) => ({ ...prev, criticalBins: critical }));
      },
      () => {}
    );

    return () => {
      unsubToday();
      unsubPending();
      unsubBio();
      unsubBins();
    };
  }, []);

  return { stats, loading };
}

export function useComplaints(filters = {}) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    const constraints = [orderBy('created_at', 'desc')];

    if (filters.status && filters.status !== 'All') {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.ward && filters.ward !== 'All') {
      constraints.push(where('ward_id', '==', filters.ward));
    }
    if (filters.citizenId) {
      constraints.push(where('citizen_id', '==', filters.citizenId));
    }
    if (filters.workerId) {
      constraints.push(where('assigned_worker', '==', filters.workerId));
    }
    if (filters.limitN) {
      constraints.push(limit(filters.limitN));
    }
    if (filters.todayOnly) {
      constraints.push(where('created_at', '>=', todayStart()));
    }

    const unsub = onSnapshot(
      query(collection(db, 'complaints'), ...constraints),
      (snap) => {
        setComplaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [filterKey]);

  return { complaints, loading };
}

export function useBins() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const binsRef = ref(rtdb, 'smart_bins');
    const unsub = onValue(
      binsRef,
      (snap) => {
        const data = snap.val() || {};
        const arr = Object.entries(data).map(([id, bin]) => ({
          id,
          ...bin,
          status: (bin.fill || 0) > 80 ? 'Critical' : (bin.fill || 0) >= 50 ? 'Warning' : 'Good',
        }));
        setBins(arr);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { bins, loading };
}

export function useBioWaste(filters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    const constraints = [orderBy('created_at', 'desc')];

    if (filters.type && filters.type !== 'All') {
      constraints.push(where('type', '==', filters.type));
    }
    if (filters.sellerId) {
      constraints.push(where('seller_id', '==', filters.sellerId));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    const unsub = onSnapshot(
      query(collection(db, 'bio_waste_market'), ...constraints),
      (snap) => {
        setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [filterKey]);

  return { listings, loading };
}

export function useWards() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'wards'), orderBy('score', 'desc')),
      (snap) => {
        setWards(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { wards, loading };
}

export function useChartData() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sevenDaysAgo = daysAgo(7);

    const unsub = onSnapshot(
      query(
        collection(db, 'complaints'),
        where('created_at', '>=', sevenDaysAgo),
        orderBy('created_at', 'asc')
      ),
      (snap) => {
        const complaints = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const wardCount = {};
        const typeCount = {};
        const dayFiled = Array(7).fill(0);
        const dayResolved = Array(7).fill(0);

        complaints.forEach((c) => {
          if (c.ward_id) wardCount[c.ward_id] = (wardCount[c.ward_id] || 0) + 1;
          if (c.type) typeCount[c.type] = (typeCount[c.type] || 0) + 1;
          if (c.created_at) {
            const date = c.created_at.toDate ? c.created_at.toDate() : new Date(c.created_at);
            const dayIdx = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIdx < 7) {
              dayFiled[6 - dayIdx]++;
              if (c.status === 'Resolved') dayResolved[6 - dayIdx]++;
            }
          }
        });

        const dayLabels = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-IN', { weekday: 'short' });
        });

        const wardLabels = Object.keys(wardCount).slice(0, 8);
        const typeLabels = Object.keys(typeCount);
        const COLORS = ['#0F4C81', '#00A86B', '#E53935', '#FFC107', '#6C5CE7', '#00b4d8', '#fd7f6f', '#b2e061'];
        const BIO_TYPES = ['Jasmine', 'Rose', 'Temple Flowers', 'Banana Leaves', 'Coconut Shell', 'Vegetable Waste'];

        setChartData({
          wardComplaints: {
            labels: wardLabels.length ? wardLabels : ['No Data'],
            datasets: [{
              label: 'Complaints',
              data: wardLabels.length ? wardLabels.map((w) => wardCount[w]) : [0],
              backgroundColor: COLORS.slice(0, wardLabels.length || 1).map((c) => c + 'cc'),
              borderRadius: 8,
              borderSkipped: false,
            }],
          },
          complaintTypes: {
            labels: typeLabels.length ? typeLabels : ['No Data'],
            datasets: [{
              data: typeLabels.length ? typeLabels.map((t) => typeCount[t]) : [1],
              backgroundColor: COLORS.slice(0, typeLabels.length || 1),
              borderWidth: 0,
              hoverOffset: 8,
            }],
          },
          weeklyTrend: {
            labels: dayLabels,
            datasets: [
              {
                label: 'Complaints Filed',
                data: dayFiled,
                borderColor: '#0F4C81',
                backgroundColor: 'rgba(15,76,129,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0F4C81',
                pointRadius: 5,
              },
              {
                label: 'Resolved',
                data: dayResolved,
                borderColor: '#00A86B',
                backgroundColor: 'rgba(0,168,107,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00A86B',
                pointRadius: 5,
              },
            ],
          },
          bioWaste: {
            labels: BIO_TYPES,
            datasets: [{
              data: BIO_TYPES.map(() => 0),
              backgroundColor: COLORS.slice(0, BIO_TYPES.length),
              borderWidth: 0,
              hoverOffset: 6,
            }],
          },
        });
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  return { chartData, loading };
}

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('__name__', '==', uid)),
      () => {},
      () => setLoading(false)
    );
    return () => unsub();
  }, [uid]);

  return { profile, loading };
}

export function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'worker')),
      (snap) => {
        setWorkers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { workers, loading };
}

export function useNotifications(uid, role) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const constraints = [orderBy('created_at', 'desc'), limit(20)];

    if (role !== 'officer') {
      constraints.push(where('user_id', '==', uid));
    }

    const unsub = onSnapshot(
      query(collection(db, 'complaints'), where('status', '==', 'In Progress'), limit(5)),
      (snap) => {
        const notifs = snap.docs.map((d) => ({
          id: d.id,
          message: `Complaint assigned: ${d.data().type || 'Issue'} – ${d.data().ward_id || ''}`,
          type: 'info',
          time: d.data().updated_at?.toDate?.()?.toLocaleTimeString?.() || '',
          read: false,
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      },
      () => {}
    );
    return () => unsub();
  }, [uid, role]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}
