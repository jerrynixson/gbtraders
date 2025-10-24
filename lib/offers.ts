import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, getDoc, query, where, Timestamp, orderBy, startAt, endAt } from "firebase/firestore";

export interface Offer {
  name: string;
  email: string;
  offer: number;
  phone: string;
  timestamp: any;
  uid: string;
  vehicleId?: string; // Add vehicleId field for new compound ID structure
}

// Submit an offer for a vehicle (using compound document ID: vehicleId_timestamp_userId)
export async function submitOffer(vehicleId: string, data: Omit<Offer, "timestamp">) {
  const timestamp = Timestamp.now();
  const compoundId = `${vehicleId}_${timestamp.toMillis()}_${data.uid}`;
  const offerRef = doc(collection(db, "offers"), compoundId);
  
  await setDoc(offerRef, {
    ...data,
    vehicleId, // Store vehicleId for easier querying
    timestamp,
  });
}

// Fetch offers for a list of vehicle IDs (for dealer dashboard)
// Handles both old format (vehicleId as doc ID) and new format (compound IDs)
// Prioritizes new format offers and only falls back to old format if no new offers exist
export async function fetchOffersForVehicles(vehicleIds: string[]) {
  if (vehicleIds.length === 0) return [];
  
  const offersCol = collection(db, "offers");
  const allOffers: any[] = [];
  
  // For each vehicle, fetch new format offers first, then fall back to old format if needed
  for (const vehicleId of vehicleIds) {
    try {
      // Fetch new format offers (compound document IDs)
      const newFormatQuery = query(
        offersCol,
        orderBy("__name__"),
        startAt(`${vehicleId}_`),
        endAt(`${vehicleId}_\uf8ff`)
      );
      const newSnapshot = await getDocs(newFormatQuery);
      
      if (!newSnapshot.empty) {
        // New format offers exist - use them
        const newOffers = newSnapshot.docs.map(doc => ({ 
          id: doc.id,
          vehicleId: vehicleId, // Explicitly set vehicleId for compound IDs
          ...doc.data() 
        }));
        allOffers.push(...newOffers);
      } else {
        // No new format offers - check for old format offer as fallback
        try {
          const oldFormatDoc = await getDoc(doc(offersCol, vehicleId));
          if (oldFormatDoc.exists()) {
            allOffers.push({ 
              id: oldFormatDoc.id, 
              vehicleId: vehicleId, // Ensure vehicleId is set for old format too
              ...oldFormatDoc.data() 
            });
          }
        } catch (error) {
          console.warn(`Error fetching old format offer for vehicle ${vehicleId}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Error fetching offers for vehicle ${vehicleId}:`, error);
    }
  }
  
  // Sort by timestamp (newest first)
  return allOffers
    .sort((a, b) => {
      if (a.timestamp && b.timestamp && a.timestamp.toMillis && b.timestamp.toMillis) {
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      }
      return 0;
    });
}

// Fetch offers for a specific vehicle (for vehicle-info page)
// Handles both old format (vehicleId as doc ID) and new format (compound IDs)
export async function fetchOffersForVehicle(vehicleId: string) {
  const offersCol = collection(db, "offers");
  const allOffers: any[] = [];
  
  // Fetch old format offer (where document ID is just vehicleId)
  try {
    const oldFormatDoc = doc(offersCol, vehicleId);
    const oldSnapshot = await getDocs(query(offersCol, where("__name__", "==", vehicleId)));
    if (!oldSnapshot.empty) {
      const oldOffer = oldSnapshot.docs[0];
      allOffers.push({ 
        id: oldOffer.id,
        vehicleId: oldOffer.id,
        ...oldOffer.data() 
      });
    }
  } catch (error) {
    console.warn(`Error fetching old format offer for vehicle ${vehicleId}:`, error);
  }
  
  // Fetch new format offers (compound document IDs)
  try {
    const newFormatQuery = query(
      offersCol,
      orderBy("__name__"),
      startAt(`${vehicleId}_`),
      endAt(`${vehicleId}_\uf8ff`)
    );
    const newSnapshot = await getDocs(newFormatQuery);
    const newOffers = newSnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data() 
    }));
    allOffers.push(...newOffers);
  } catch (error) {
    console.warn(`Error fetching new format offers for vehicle ${vehicleId}:`, error);
  }
  
  // Sort by timestamp (newest first) and ensure vehicleId field exists
  return allOffers
    .map(offer => ({
      ...offer,
      // Ensure vehicleId field exists (for backward compatibility with old format)
      vehicleId: offer.vehicleId || vehicleId
    }))
    .sort((a, b) => {
      if (a.timestamp && b.timestamp && a.timestamp.toMillis && b.timestamp.toMillis) {
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      }
      return 0;
    });
}
