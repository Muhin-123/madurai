import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Full Firestore doc
  const [userRole, setUserRole] = useState(null);        // Shorthand role string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);

          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              const role = data.role || 'citizen';
              setUserRole(role);
              setUserProfile({ uid: user.uid, ...data });
            } else {
              console.warn('⚠️ No Firestore user doc found for uid:', user.uid);
              setUserRole('citizen');
              setUserProfile({ uid: user.uid, name: user.email, role: 'citizen' });
            }
          } catch (firestoreError) {
            console.error('❌ Firestore role fetch error:', firestoreError);
            setUserRole('citizen');
            setUserProfile({ uid: user.uid, name: user.email, role: 'citizen' });
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      throw err;
    }
  };

  const register = async (email, password, name, role) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      const userData = {
        uid,
        name: name.trim(),
        email,
        role,
        points: 0,
        avatar_url: null,
        ward: null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userData);
      console.log('✅ Firestore user doc created with role:', role);

      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAuthErrorMessage = (code) => {
    const messages = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'Email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Authentication is disabled.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
    };
    return messages[code] || 'Authentication failed. Please try again.';
  };

  const value = {
    currentUser,
    userProfile,     // Full Firestore profile: { uid, name, email, role, points, ... }
    userRole,        // Shorthand: 'citizen' | 'worker' | 'officer'
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
