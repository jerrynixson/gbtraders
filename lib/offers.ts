import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

export interface Offer {
  name: string;
  email: string;
  offer: number;
  phone: string;
  timestamp: any;
  uid: string;
}

// Submit an offer for a vehicle (vehicleId is used as document ID)
export async function submitOffer(vehicleId: string, data: Omit<Offer, "timestamp">) {
  const offerRef = doc(collection(db, "offers"), vehicleId);
  await setDoc(offerRef, {
    ...data,
    timestamp: Timestamp.now(),
  });
}

// Fetch offers for a list of vehicle IDs (for dealer dashboard)
export async function fetchOffersForVehicles(vehicleIds: string[]) {
  if (vehicleIds.length === 0) return [];
  const offersCol = collection(db, "offers");
  const q = query(offersCol, where("__name__", "in", vehicleIds));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
