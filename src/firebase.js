import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBFfJfhA8z_URZZdnFIKmcwM0G36lVPXHA",
  authDomain: "clean-madurai-b7c74.firebaseapp.com",
  projectId: "clean-madurai-b7c74",
  storageBucket: "clean-madurai-b7c74.firebasestorage.app",
  messagingSenderId: "558002254868",
  appId: "1:558002254868:web:26dfd6224978d9a3016301",
  measurementId: "G-7P9YLWS6MN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(() => {});

export default app;
