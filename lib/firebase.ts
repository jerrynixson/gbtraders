import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Enable persistence with error handling
if (typeof window !== 'undefined') {
  // Set auth persistence
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Auth persistence error:", error);
    });

  // Enable offline persistence for Firestore with error handling
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('The current browser does not support persistence.');
      } else if (err.code === 'indexeddb-corrupted') {
        // IndexedDB is corrupted, try to clear it
        console.warn('IndexedDB is corrupted. Clearing data...');
        if (window.indexedDB) {
          try {
            window.indexedDB.deleteDatabase('firebaseLocalStorageDb');
            window.indexedDB.deleteDatabase('firestore');
            console.log('IndexedDB databases cleared. Please refresh the page.');
          } catch (e) {
            console.error('Error clearing IndexedDB:', e);
          }
        }
      }
    });
} 