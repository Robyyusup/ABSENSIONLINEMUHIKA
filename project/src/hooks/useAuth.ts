import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snapshot = await get(ref(database, `users/${firebaseUser.uid}`));
          const userData = snapshot.val();
          
          if (userData) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: userData.role,
              name: userData.name,
              associatedClass: userData.associatedClass
            });
          } else {
            setError('Informasi pengguna tidak ditemukan. Silakan hubungi admin.');
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Gagal memuat data pengguna');
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Gagal logout');
    }
  };

  return { user, loading, error, logout, setError };
};