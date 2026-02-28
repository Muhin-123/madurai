import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Temporary mock user for testing without Firebase
  const [user, setUser] = useState({ uid: 'mock-user', email: 'officer@cleanmadurai.com' });
  const [userProfile, setUserProfile] = useState({
    uid: 'mock-user',
    role: 'officer', // Change this to 'citizen' or 'worker' to test those views
    name: 'Test Officer',
    email: 'officer@cleanmadurai.com',
    points: 100
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Disabled real Firebase Auth listener temporarily so you can test all pages
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, name, role = 'citizen') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role,
      points: 0,
      avatar_url: null,
      ward: null,
      createdAt: serverTimestamp(),
    });
    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
