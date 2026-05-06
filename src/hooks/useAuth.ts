import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  goal: string;
  diet: string;
  onboardingComplete: boolean;
  streak: number;
  lastLogDate?: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      }, (err) => {
        console.error("Error listening to profile", err);
        setProfileLoading(false);
      });
    } else {
      setProfile(null);
      if (!loading) setProfileLoading(false);
    }

    return () => unsubscribe?.();
  }, [user, loading]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    
    const updatedData = {
      ...profile,
      ...data,
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      updatedAt: serverTimestamp(),
    };
    
    // For create (first time)
    if (!profile) {
      (updatedData as any).createdAt = serverTimestamp();
      (updatedData as any).streak = 0;
      // Do not overwrite onboardingComplete if it's in data
      if (data.onboardingComplete === undefined) {
        (updatedData as any).onboardingComplete = false;
      }
    }

    await setDoc(docRef, updatedData, { merge: true });
    // setProfile update will happen via onSnapshot
  };

  return { user, loading: loading || profileLoading, error, profile, updateProfile };
}
