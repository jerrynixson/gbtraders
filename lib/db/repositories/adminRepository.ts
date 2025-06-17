import { db } from "@/lib/db/firebase";
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export class AdminRepository {
  private readonly collectionName = "admins";

  async isAdmin(uid: string): Promise<boolean> {
    try {
      const adminDoc = await getDoc(doc(db, this.collectionName, uid));
      return adminDoc.exists();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  async addAdmin(email: string): Promise<boolean> {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("You must be logged in to add an admin");
      }

      // First check if the email is already in the admins collection
      const adminQuery = query(collection(db, this.collectionName), where("email", "==", email));
      const adminSnapshot = await getDocs(adminQuery);
      
      if (!adminSnapshot.empty) {
        throw new Error("User is already an admin");
      }

      // Get the user's UID from the users collection
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error("User not found. Please make sure the user has signed up first.");
      }

      const userDoc = userSnapshot.docs[0];
      const uid = userDoc.id;

      // Add user to admins collection
      await setDoc(doc(db, this.collectionName, uid), {
        email: email,
        addedAt: new Date().toISOString(),
        addedBy: auth.currentUser.uid
      });

      return true;
    } catch (error) {
      console.error("Error adding admin:", error);
      throw error;
    }
  }

  async getAdminEmails(): Promise<string[]> {
    try {
      const adminSnapshot = await getDocs(collection(db, this.collectionName));
      return adminSnapshot.docs.map(doc => doc.data().email);
    } catch (error) {
      console.error("Error getting admin emails:", error);
      return [];
    }
  }

  // Helper method to check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false;
    }

    return this.isAdmin(currentUser.uid);
  }
} 