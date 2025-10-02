'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  organization?: string;
  permissions?: Record<string, boolean>;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore with error handling
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              id: firebaseUser.uid,
              email: data.email,
              name: data.name,
              role: data.role,
              phone: data.phone,
              organization: data.organization,
              permissions: data.permissions
            });
          } else {
            // User authenticated but no Firestore document
            setUserData({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'student', // Default role
              permissions: {}
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic user data from Firebase Auth
          setUserData({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'student', // Default role
            permissions: {}
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch user data to determine role
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role = data.role;
          
          // Check verification status for roles that require it
          if ((role === 'rto_admin' || role === 'provider_admin') && data.verificationStatus !== 'verified') {
            // Redirect to verification pending page for unverified users
            router.push('/rto/verification-pending');
            return;
          }
          
          // Redirect based on role
          switch (role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'student':
              router.push('/student/dashboard');
              break;
            case 'rto':
            case 'rto_admin':
              router.push('/rto/dashboard');
              break;
            case 'provider':
            case 'provider_admin':
              router.push('/provider/dashboard');
              break;
            case 'supervisor':
              router.push('/supervisor/dashboard');
              break;
            case 'assessor':
              router.push('/assessor/dashboard');
              break;
            default:
              router.push('/');
          }
        } else {
          // If no Firestore document exists, redirect to home
          router.push('/');
        }
      } catch (firestoreError) {
        console.error('Error fetching user role, redirecting to home:', firestoreError);
        router.push('/');
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserData>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name: userData.name || '',
        role: userData.role || 'student',
        phone: userData.phone || '',
        organization: userData.organization || '',
        active: true,
        createdAt: new Date(),
        permissions: userData.permissions || {}
      });
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logOut
  };
}