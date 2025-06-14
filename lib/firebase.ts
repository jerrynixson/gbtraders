import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, User } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, collection, query, where, getDocs, deleteDoc, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Sanitize environment variables
const sanitizeEnvVar = (value: string | undefined): string => {
  if (!value) return '';
  // Remove any newlines, carriage returns, and trim whitespace
  return value.replace(/[\r\n]+/g, '').trim();
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

// Validate Firebase config
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing or invalid Firebase config: ${key}`);
  }
});

// Initialize Firebase with error handling
let firebaseApp;
try {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export const auth = getAuth(firebaseApp);

// Initialize Firestore with conditional persistence for App Hosting compatibility
let db: Firestore;
try {
  // Check if we're in a browser environment and not in Firebase App Hosting SSR
  const isClientSide = typeof window !== 'undefined';
  const isAppHosting = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  
  if (isClientSide && !isAppHosting) {
    // Use persistent cache only in client-side browser environments
    db = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } else {
    // Use default Firestore initialization for server-side or App Hosting
    db = getFirestore(firebaseApp);
  }
} catch (error) {
  console.error('Error initializing Firestore with persistence, falling back to default:', error);
  // Fallback to default Firestore if persistent cache fails
  try {
    db = getFirestore(firebaseApp);
  } catch (fallbackError) {
    console.error('Error initializing Firestore with fallback:', fallbackError);
    throw fallbackError;
  }
}

export { db };
export const storage = getStorage(firebaseApp);

// Role-based authentication helpers
export const getUserRole = async (user: User | null): Promise<string | null> => {
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isDealer = async (user: User | null): Promise<boolean> => {
  const role = await getUserRole(user);
  return role === 'dealer';
};

export const isUser = async (user: User | null): Promise<boolean> => {
  const role = await getUserRole(user);
  return role === 'user';
};

// Set auth persistence only in browser environment
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Auth persistence error:", error);
    });
}

// Dealer listing functions
export const getDealerListings = async (userId: string) => {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('dealerUid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || `${data.make} ${data.model}`,
        price: data.price || 0,
        status: data.status || "active",
        views: data.views || 0,
        inquiries: data.inquiries || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        image: data.images?.[0] || "/placeholder-vehicle.jpg",
        make: data.make || "",
        model: data.model || "",
        year: data.year || new Date().getFullYear(),
        mileage: data.mileage || 0,
        fuel: data.fuel || "",
        transmission: data.transmission || "",
        description: data.description || "",
        images: data.images || [],
        updatedAt: data.updatedAt || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Error getting dealer listings:', error);
    return [];
  }
};

export const deleteListing = async (listingId: string) => {
  try {
    const listingRef = doc(db, 'vehicles', listingId);
    await deleteDoc(listingRef);
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

// Debug logging - remove quotes around values to see clean output
if (typeof window !== 'undefined') {
  console.log('[Firebase Config - Client Side]');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('App ID:', firebaseConfig.appId);
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
}