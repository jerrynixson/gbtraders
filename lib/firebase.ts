import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, User } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);

// Initialize Firestore with the new persistence configuration
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

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

// Set auth persistence
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