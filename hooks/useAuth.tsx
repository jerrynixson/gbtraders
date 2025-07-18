"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
  AuthError,
  sendEmailVerification as sendFirebaseEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as signInWithFirebaseEmailLink
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface User extends FirebaseUser {
  role?: 'user' | 'dealer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<any>;
  sendVerificationEmail: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  completeEmailSignIn: (email: string) => Promise<UserCredential>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_VERIFICATION_URL || 'http://localhost:3000/verify-email',
  handleCodeInApp: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          // If user document doesn't exist yet or can't be accessed, don't throw an error
          if (!userDoc.exists()) {
            // Set basic user info without Firestore data
            const basicUser = Object.assign(firebaseUser, {
              role: 'user' // Default to user role
            }) as User;
            setUser(basicUser);
            setLoading(false);
            return;
          }

          let userData = userDoc.data();
          
          // Extend the Firebase user with our custom data
          const extendedUser = Object.assign(firebaseUser, {
            role: userData?.role || 'user' // Default to user if not set
          }) as User;
          
          setUser(extendedUser);
        } catch (error) {
          // Don't log the error to console to avoid alarming users
          // Just use basic Firebase user info
          const basicUser = Object.assign(firebaseUser, {
            role: 'user' // Default to user role
          }) as User;
          setUser(basicUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendFirebaseEmailVerification(userCredential.user);
      
      // Create user document with verification status and names
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        role: 'user',
        firstName,
        lastName
      });

      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }

      // Update verification status in Firestore if needed
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && !userDoc.data().emailVerified) {
        await updateDoc(doc(db, "users", userCredential.user.uid), {
          emailVerified: true
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      }
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }
    await sendFirebaseEmailVerification(user);
  };

  const signInWithEmail = async (email: string) => {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Store email for use in completeEmailSignIn
    window.localStorage.setItem('emailForSignIn', email);
  };

  const completeEmailSignIn = async (email: string) => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid sign in link');
    }
    return await signInWithFirebaseEmailLink(auth, email);
  };

  const isEmailVerified = () => {
    return user?.emailVerified || false;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    getUserProfile: async () => {
      if (!user) {
        throw new Error('No user logged in');
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      return userDoc.data();
    },
    sendVerificationEmail,
    signInWithEmail,
    completeEmailSignIn,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 