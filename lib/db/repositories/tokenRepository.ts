import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, updateDoc, setDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/db/firebase';

export interface PlanDetails {
  name: string;
  totalTokens: number;
  usedTokens: number;
  startDate: Date;
  endDate: Date;
  purchaseHistory: PurchaseRecord[];
  isActive: boolean;
}

export interface PurchaseRecord {
  planName: string;
  purchaseDate: Date;
  amount: number;
  stripeSessionId: string;
  tokens: number;
  validity: number; // days
}

export interface TokenizedVehicle {
  id: string;
  tokenStatus: 'active' | 'inactive';
  tokenActivatedDate?: Date;
  tokenExpiryDate?: Date;
  deactivationReason?: 'user_choice' | 'plan_expired' | 'token_limit_reached' | 'manual';
}

export interface UserPlanInfo {
  uid: string;
  planName?: string;
  planStartDate?: Date;
  planEndDate?: Date;
  totalTokens: number;
  usedTokens: number; 
  purchaseHistory: PurchaseRecord[];
  lastPaymentStatus?: 'completed' | 'failed' | 'expired';
  lastPaymentDate?: Date;
}

export class TokenRepository {
  private usersCollection = collection(db, 'users');
  private dealersCollection = collection(db, 'dealers');
  private vehiclesCollection = collection(db, 'vehicles');
  private inactiveVehiclesCollection = collection(db, 'inactiveVehicles');

  /**
   * Get user's plan information
   */
  async getUserPlanInfo(userId: string, userType: 'user' | 'dealer' = 'dealer'): Promise<UserPlanInfo | null> {
    try {
      // Always use the users collection regardless of userType
      const userDoc = await getDoc(doc(this.usersCollection, userId));

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        uid: userId,
        planName: data.planName,
        planStartDate: data.planStartDate?.toDate(),
        planEndDate: data.planEndDate?.toDate(),
        totalTokens: data.totalTokens || 0,
        usedTokens: data.usedTokens || 0,
        purchaseHistory: (data.purchaseHistory || []).map((record: any) => ({
          ...record,
          purchaseDate: record.purchaseDate?.toDate()
        })),
        lastPaymentStatus: data.lastPaymentStatus,
        lastPaymentDate: data.lastPaymentDate?.toDate()
      };
    } catch (error) {
      console.error('Error getting user plan info:', error);
      return null;
    }
  }

  /**
   * Update user plan information after successful payment
   */
  async updateUserPlan(
    userId: string,
    userType: 'user' | 'dealer',
    planData: {
      planName: string;
      totalTokens: number;
      validity: number; // days
      amount: number;
      stripeSessionId: string;
      isUpgrade?: boolean;
      isRenewal?: boolean;
    }
  ): Promise<void> {
    try {
      // Always use the users collection
      const userRef = doc(this.usersCollection, userId);
      const currentDoc = await getDoc(userRef);

      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planData.validity);

      const purchaseRecord: PurchaseRecord = {
        planName: planData.planName,
        purchaseDate: now,
        amount: planData.amount,
        stripeSessionId: planData.stripeSessionId,
        tokens: planData.totalTokens,
        validity: planData.validity
      };

      // Get current user data to preserve purchase history and tokens
      const currentData = currentDoc.exists() ? currentDoc.data() : {};
      const currentHistory = currentData.purchaseHistory || [];

      // Calculate tokens for upgrades and renewals
      let finalTotalTokens = planData.totalTokens;
      let finalUsedTokens = 0;
      
      if (planData.isUpgrade || planData.isRenewal) {
        // For upgrades/renewals: totalTokens = (currentTotal - currentUsed) + newPlanAllocation
        const currentTotalTokens = currentData.totalTokens || 0;
        const currentUsedTokens = currentData.usedTokens || 0;
        const remainingTokens = Math.max(0, currentTotalTokens - currentUsedTokens);
        
        finalTotalTokens = remainingTokens + planData.totalTokens;
        finalUsedTokens = 0; // Reset to allow full usage
      }

      const updateData = {
        planName: planData.planName,
        planStartDate: Timestamp.fromDate(now),
        planEndDate: Timestamp.fromDate(endDate),
        totalTokens: finalTotalTokens,
        usedTokens: finalUsedTokens,
        purchaseHistory: [...currentHistory, {
          ...purchaseRecord,
          purchaseDate: Timestamp.fromDate(purchaseRecord.purchaseDate)
        }],
        lastPaymentStatus: 'completed',
        lastPaymentDate: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      if (currentDoc.exists()) {
        await updateDoc(userRef, updateData);
      } else {
        // If document doesn't exist, create it
        await setDoc(userRef, {
          uid: userId,
          createdAt: Timestamp.fromDate(now),
          ...updateData
        });
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  }  /**
   * Check if user's plan is active and has available tokens
   */
  async checkTokenAvailability(userId: string, userType: 'user' | 'dealer' = 'dealer'): Promise<{
    hasActivePlan: boolean;
    hasAvailableTokens: boolean;
    availableTokens: number;
    planExpired: boolean;
    planInfo: UserPlanInfo | null;
  }> {
    const planInfo = await this.getUserPlanInfo(userId, userType);
    
    if (!planInfo) {
      return {
        hasActivePlan: false,
        hasAvailableTokens: false,
        availableTokens: 0,
        planExpired: false,
        planInfo: null
      };
    }

    const now = new Date();
    const planExpired = planInfo.planEndDate ? planInfo.planEndDate < now : true;
    const hasActivePlan = !planExpired && !!planInfo.planName;
    const availableTokens = Math.max(0, planInfo.totalTokens - planInfo.usedTokens);
    const hasAvailableTokens = hasActivePlan && availableTokens > 0;

    return {
      hasActivePlan,
      hasAvailableTokens,
      availableTokens,
      planExpired,
      planInfo
    };
  }

  /**
   * Activate a token for a vehicle
   */
  async activateVehicleToken(
    userId: string,
    vehicleId: string,
    userType: 'user' | 'dealer' = 'dealer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const availability = await this.checkTokenAvailability(userId, userType);
      
      if (!availability.hasAvailableTokens) {
        return {
          success: false,
          error: availability.planExpired 
            ? 'Your plan has expired. Please renew to activate listings.'
            : 'No available tokens. Please upgrade your plan.'
        };
      }

      const batch = writeBatch(db);
      
      // Update vehicle with token info
      const vehicleRef = doc(this.vehiclesCollection, vehicleId);
      const now = new Date();
      const expiryDate = availability.planInfo?.planEndDate || new Date();
      
      batch.update(vehicleRef, {
        tokenStatus: 'active',
        tokenActivatedDate: Timestamp.fromDate(now),
        tokenExpiryDate: Timestamp.fromDate(expiryDate),
        updatedAt: Timestamp.fromDate(now)
      });

      // Update user's used token count - always use users collection
      const userRef = doc(this.usersCollection, userId);
      batch.update(userRef, {
        usedTokens: (availability.planInfo?.usedTokens || 0) + 1,
        updatedAt: Timestamp.fromDate(now)
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error activating vehicle token:', error);
      return { success: false, error: 'Failed to activate token' };
    }
  }

  /**
   * Deactivate a token for a vehicle
   */
  async deactivateVehicleToken(
    userId: string,
    vehicleId: string,
    reason: 'user_choice' | 'plan_expired' | 'token_limit_reached' | 'manual',
    userType: 'user' | 'dealer' = 'dealer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const batch = writeBatch(db);
      const now = new Date();

      // Move vehicle to inactive collection
      const vehicleRef = doc(this.vehiclesCollection, vehicleId);
      const vehicleDoc = await getDoc(vehicleRef);
      
      if (!vehicleDoc.exists()) {
        return { success: false, error: 'Vehicle not found' };
      }

      const vehicleData = vehicleDoc.data();
      
      // Add to inactive vehicles collection
      const inactiveVehicleRef = doc(this.inactiveVehiclesCollection, vehicleId);
      batch.set(inactiveVehicleRef, {
        ...vehicleData,
        tokenStatus: 'inactive',
        tokenDeactivatedDate: Timestamp.fromDate(now),
        deactivationReason: reason,
        updatedAt: Timestamp.fromDate(now)
      });

      // Update original vehicle with inactive status
      batch.update(vehicleRef, {
        tokenStatus: 'inactive',
        tokenDeactivatedDate: Timestamp.fromDate(now),
        deactivationReason: reason,
        updatedAt: Timestamp.fromDate(now)
      });

      // Update user's used token count only if it was previously active AND not user_choice
      // For user_choice deactivation, we keep the token as "used" so it counts against available tokens on reactivation
      if (vehicleData.tokenStatus === 'active' && reason !== 'user_choice') {
        const planInfo = await this.getUserPlanInfo(userId, userType);
        if (planInfo) {
          // Always use users collection
          const userRef = doc(this.usersCollection, userId);
          batch.update(userRef, {
            usedTokens: Math.max(0, planInfo.usedTokens - 1),
            updatedAt: Timestamp.fromDate(now)
          });
        }
      }

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error deactivating vehicle token:', error);
      return { success: false, error: 'Failed to deactivate token' };
    }
  }

  /**
   * Get all vehicles (active and inactive) for a dealer
   */
  async getDealerAllVehicles(dealerId: string): Promise<{
    activeVehicles: any[];
    inactiveVehicles: any[];
    totalVehicles: number;
  }> {
    try {
      // Get active vehicles
      const activeQuery = query(
        this.vehiclesCollection,
        where('dealerUid', '==', dealerId),
        orderBy('createdAt', 'desc')
      );
      const activeSnapshot = await getDocs(activeQuery);
      const activeVehicles = activeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        tokenActivatedDate: doc.data().tokenActivatedDate?.toDate(),
        tokenExpiryDate: doc.data().tokenExpiryDate?.toDate(),
        tokenDeactivatedDate: doc.data().tokenDeactivatedDate?.toDate()
      }));

      // Get inactive vehicles
      const inactiveQuery = query(
        this.inactiveVehiclesCollection,
        where('dealerUid', '==', dealerId),
        orderBy('createdAt', 'desc')
      );
      const inactiveSnapshot = await getDocs(inactiveQuery);
      const inactiveVehicles = inactiveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        tokenActivatedDate: doc.data().tokenActivatedDate?.toDate(),
        tokenExpiryDate: doc.data().tokenExpiryDate?.toDate(),
        tokenDeactivatedDate: doc.data().tokenDeactivatedDate?.toDate()
      }));

      return {
        activeVehicles,
        inactiveVehicles,
        totalVehicles: activeVehicles.length + inactiveVehicles.length
      };
    } catch (error) {
      console.error('Error getting dealer vehicles:', error);
      return {
        activeVehicles: [],
        inactiveVehicles: [],
        totalVehicles: 0
      };
    }
  }

  /**
   * Process expired plans (to be run daily)
   */
  async processExpiredPlans(): Promise<void> {
    try {
      const now = new Date();
      
      // Process both users and dealers
      for (const collectionRef of [this.usersCollection, this.dealersCollection]) {
        const expiredQuery = query(
          collectionRef,
          where('planEndDate', '<=', Timestamp.fromDate(now)),
          where('planName', '!=', null)
        );
        
        const expiredSnapshot = await getDocs(expiredQuery);
        
        for (const userDoc of expiredSnapshot.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();
          
          // Get all active vehicles for this user
          const activeVehiclesQuery = query(
            this.vehiclesCollection,
            where('dealerUid', '==', userId),
            where('tokenStatus', '==', 'active')
          );
          
          const activeVehiclesSnapshot = await getDocs(activeVehiclesQuery);
          
          // Deactivate all active vehicles
          for (const vehicleDoc of activeVehiclesSnapshot.docs) {
            await this.deactivateVehicleToken(
              userId,
              vehicleDoc.id,
              'plan_expired',
              collectionRef === this.dealersCollection ? 'dealer' : 'user'
            );
          }
          
          // Update user plan status
          await updateDoc(doc(collectionRef, userId), {
            planName: null,
            usedTokens: 0,
            updatedAt: Timestamp.fromDate(now)
          });
        }
      }
    } catch (error) {
      console.error('Error processing expired plans:', error);
      throw error;
    }
  }
}

export const tokenRepository = new TokenRepository();
