import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/db/firebase';

export class FavoritesRepository {
  private collection = collection(db, 'favorites');

  /**
   * Add a vehicle to user's favorites
   */
  async addToFavorites(userId: string, vehicleId: string): Promise<void> {
    const userFavoritesRef = doc(this.collection, userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);

    if (!userFavoritesDoc.exists()) {
      // Create new document if it doesn't exist
      await setDoc(userFavoritesRef, {
        userId,
        vehicleIds: [vehicleId],
        updatedAt: new Date()
      });
    } else {
      // Update existing document
      await updateDoc(userFavoritesRef, {
        vehicleIds: arrayUnion(vehicleId),
        updatedAt: new Date()
      });
    }
  }

  /**
   * Remove a vehicle from user's favorites
   */
  async removeFromFavorites(userId: string, vehicleId: string): Promise<void> {
    const userFavoritesRef = doc(this.collection, userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);

    if (userFavoritesDoc.exists()) {
      await updateDoc(userFavoritesRef, {
        vehicleIds: arrayRemove(vehicleId),
        updatedAt: new Date()
      });
    }
  }

  /**
   * Get user's favorite vehicle IDs
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    const userFavoritesRef = doc(this.collection, userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);

    if (userFavoritesDoc.exists()) {
      return userFavoritesDoc.data().vehicleIds || [];
    }
    return [];
  }

  /**
   * Check if a vehicle is in user's favorites
   */
  async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const favorites = await this.getUserFavorites(userId);
    return favorites.includes(vehicleId);
  }
} 