import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, getDoc, query, where, Timestamp, orderBy, startAt, endAt, updateDoc } from "firebase/firestore";
import { createNotification } from "./notifications";

export type OfferStatus = 'pending' | 'accepted' | 'declined';

export interface Offer {
  name: string;
  email: string;
  offer: number;
  phone: string;
  timestamp: any;
  uid: string;
  vehicleId?: string; // Add vehicleId field for new compound ID structure
  status?: OfferStatus; // Add status field for offer management
}

// Submit an offer for a vehicle (using compound document ID: vehicleId_timestamp_userId)
export async function submitOffer(vehicleId: string, data: Omit<Offer, "timestamp" | "status">) {
  const timestamp = Timestamp.now();
  const compoundId = `${vehicleId}_${timestamp.toMillis()}_${data.uid}`;
  const offerRef = doc(collection(db, "offers"), compoundId);
  
  // Create the offer with pending status
  await setDoc(offerRef, {
    ...data,
    vehicleId, // Store vehicleId for easier querying
    timestamp,
    status: 'pending' as OfferStatus,
  });

  // Get vehicle details for notification
  try {
    const vehicleRef = doc(db, "vehicles", vehicleId);
    const vehicleDoc = await getDoc(vehicleRef);
    
    if (vehicleDoc.exists()) {
      const vehicleData = vehicleDoc.data();
      
      // Create notification for dealer
      await createNotification({
        userId: vehicleData.dealerUid,
        type: 'offer_received',
        data: {
          offerId: compoundId,
          vehicleId,
          vehicleMake: vehicleData.make,
          vehicleModel: vehicleData.model,
          offerAmount: data.offer
        }
      });
    }
  } catch (error) {
    console.error("Error creating notification for new offer:", error);
    // Don't throw error - offer was still created successfully
  }
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

// Update offer status and notify the offer maker
export async function updateOfferStatus(
  offerId: string, 
  newStatus: OfferStatus,
  dealerUserId: string
): Promise<void> {
  try {
    const offerRef = doc(db, "offers", offerId);
    
    // First, get the current offer to access user details
    const offerDoc = await getDoc(offerRef);
    if (!offerDoc.exists()) {
      throw new Error("Offer not found");
    }
    
    const offerData = offerDoc.data() as Offer;
    
    // Update the offer status
    await updateDoc(offerRef, {
      status: newStatus
    });

    // Get vehicle details for notification
    const vehicleId = offerData.vehicleId || offerId; // Handle old format fallback
    const vehicleRef = doc(db, "vehicles", vehicleId);
    const vehicleDoc = await getDoc(vehicleRef);
    
    if (vehicleDoc.exists()) {
      const vehicleData = vehicleDoc.data();
      
      // Verify that the dealer owns this vehicle
      if (vehicleData.dealerUid !== dealerUserId) {
        throw new Error("Unauthorized: You don't own this vehicle");
      }
      
      // Create notification for the offer maker
      await createNotification({
        userId: offerData.uid,
        type: newStatus === 'accepted' ? 'offer_accepted' : 'offer_declined',
        data: {
          offerId,
          vehicleId,
          vehicleMake: vehicleData.make,
          vehicleModel: vehicleData.model,
          offerAmount: offerData.offer
        }
      });
    }
  } catch (error) {
    console.error("Error updating offer status:", error);
    throw error;
  }
}

// Helper function to get offer status with backward compatibility
export function getOfferStatus(offer: Offer): OfferStatus {
  return offer.status || 'pending';
}
