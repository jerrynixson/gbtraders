import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DealerProfile, DealerProfileValidation } from "@/lib/types/dealer";

export class DealerRepository {
  private readonly COLLECTION_NAME = "dealers";

  async getDealerProfile(uid: string): Promise<DealerProfile | null> {
    try {
      const dealerDoc = await getDoc(doc(db, this.COLLECTION_NAME, uid));
      if (!dealerDoc.exists()) return null;
      return dealerDoc.data() as DealerProfile;
    } catch (error) {
      console.error("Error fetching dealer profile:", error);
      return null;
    }
  }

  async validateDealerProfile(uid: string): Promise<DealerProfileValidation> {
    const profile = await this.getDealerProfile(uid);
    
    if (!profile) {
      return {
        isComplete: false,
        profile: null,
        missingFields: ["Profile does not exist"]
      };
    }

    const requiredFields = [
      "businessName",
      "email",
      "phone",
      "logo",
      "address",
      "city",
      "country",
      "description"
    ];

    const missingFields = requiredFields.filter(field => !profile[field as keyof DealerProfile]);

    return {
      isComplete: missingFields.length === 0,
      profile,
      missingFields: missingFields.length > 0 ? missingFields : undefined
    };
  }

  async saveDealerProfile(profile: DealerProfile): Promise<void> {
    try {
      const timestamp = new Date();
      const updatedProfile = {
        ...profile,
        updatedAt: timestamp,
        createdAt: profile.createdAt || timestamp
      };

      await setDoc(doc(db, this.COLLECTION_NAME, profile.uid), updatedProfile);
    } catch (error) {
      console.error("Error saving dealer profile:", error);
      throw error;
    }
  }
}
