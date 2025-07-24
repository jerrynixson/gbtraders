import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Plan hierarchy in order from lowest to highest
const PLAN_HIERARCHY = [
  'Basic',
  'Private Gold', 
  'Traders Silver',
  'Traders Gold',
  'Traders Platinum'
] as const;

type PlanName = typeof PLAN_HIERARCHY[number];

// Plan configurations
const PLAN_CONFIGS = {
  'Basic': { tokens: 1, validity: 7, price: 25.00 },
  'Private Gold': { tokens: 1, validity: 30, price: 25.00 },
  'Traders Silver': { tokens: 5, validity: 10, price: 100.00 },
  'Traders Gold': { tokens: 15, validity: 30, price: 250.00 },
  'Traders Platinum': { tokens: 30, validity: 30, price: 350.00 }
} as const;

/**
 * Get available upgrade plans for a user's current plan
 */
function getAvailableUpgrades(currentPlan: string): PlanName[] {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan as PlanName);
  if (currentIndex === -1) return PLAN_HIERARCHY.slice(); // All plans if current not found
  return PLAN_HIERARCHY.slice(currentIndex + 1); // Higher tier plans only
}

/**
 * Get available renewal plans for a user's current plan (includes current plan + upgrades)
 */
function getAvailableRenewalPlans(currentPlan: string): PlanName[] {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan as PlanName);
  if (currentIndex === -1) return PLAN_HIERARCHY.slice(); // All plans if current not found
  return PLAN_HIERARCHY.slice(currentIndex); // Current plan + higher tier plans
}

/**
 * Check if targetPlan is an upgrade from currentPlan
 */
function isUpgrade(currentPlan: string, targetPlan: string): boolean {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan as PlanName);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan as PlanName);
  return targetIndex > currentIndex;
}

/**
 * Check if targetPlan is a valid renewal (same plan or upgrade) from currentPlan
 */
function isValidRenewal(currentPlan: string, targetPlan: string): boolean {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan as PlanName);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan as PlanName);
  return targetIndex >= currentIndex;
}

/**
 * Upgrade user plan and update all active vehicles with new expiration date
 */
async function upgradeUserPlan(
  userId: string, 
  userType: 'user' | 'dealer',
  newPlan: PlanName,
  sessionId: string,
  isRenewal: boolean = false
) {
  const batch = adminDb.batch();
  
  try {
    // Determine collection based on user type
    const userCollection = userType === 'dealer' ? 'dealers' : 'users';
    let userRef = adminDb.collection(userCollection).doc(userId);
    let userDoc = await userRef.get();

    // Fallback to users collection if dealer not found
    if (!userDoc.exists && userType === 'dealer') {
      userRef = adminDb.collection('users').doc(userId);
      userDoc = await userRef.get();
    }

    if (!userDoc.exists) {
      throw new Error(`User document not found for ID: ${userId}`);
    }

    const userData = userDoc.data();
    const currentPlan = userData?.planName;

    // Verify it's a valid renewal or upgrade
    if (isRenewal) {
      if (!isValidRenewal(currentPlan, newPlan)) {
        throw new Error(`${newPlan} is not a valid renewal option from ${currentPlan}`);
      }
    } else {
      if (!isUpgrade(currentPlan, newPlan)) {
        throw new Error(`${newPlan} is not an upgrade from ${currentPlan}`);
      }
    }

    const planConfig = PLAN_CONFIGS[newPlan];
    const now = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + planConfig.validity);

    // Prepare purchase record
    const purchaseRecord = {
      planName: newPlan,
      purchaseDate: now,
      amount: planConfig.price,
      stripeSessionId: sessionId,
      tokens: planConfig.tokens,
      validity: planConfig.validity,
      upgradeFrom: currentPlan,
      isRenewal: isRenewal
    };

    // Update user plan information
    const userUpdateData = {
      planName: newPlan,
      planPrice: planConfig.price,
      planStartDate: now,
      planEndDate: newEndDate,
      totalTokens: planConfig.tokens,
      // Keep current used tokens (don't reset)
      usedTokens: userData?.usedTokens || 0,
      lastPaymentDate: now,
      lastPaymentStatus: 'completed',
      purchaseHistory: [
        ...(userData?.purchaseHistory || []),
        purchaseRecord
      ]
    };

    batch.update(userRef, userUpdateData);

    // Update all active vehicles with new expiration date
    const vehiclesRef = adminDb.collection('vehicles');
    const activeVehiclesQuery = vehiclesRef
      .where('userId', '==', userId)
      .where('tokenStatus', '==', 'active');

    const activeVehiclesSnapshot = await activeVehiclesQuery.get();

    activeVehiclesSnapshot.docs.forEach(vehicleDoc => {
      const vehicleRef = vehiclesRef.doc(vehicleDoc.id);
      batch.update(vehicleRef, {
        tokenExpiryDate: newEndDate,
        updatedAt: now,
        upgradeInfo: {
          upgradedAt: now,
          fromPlan: currentPlan,
          toPlan: newPlan,
          newExpiryDate: newEndDate
        }
      });
    });

    // Execute all updates atomically
    await batch.commit();

    return {
      success: true,
      message: isRenewal 
        ? `Successfully renewed ${newPlan} plan`
        : `Successfully upgraded from ${currentPlan} to ${newPlan}`,
      updatedVehicles: activeVehiclesSnapshot.size,
      newEndDate: newEndDate.toISOString(),
      isRenewal: isRenewal
    };

  } catch (error) {
    console.error('Plan upgrade error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { targetPlan, userType = 'dealer', sessionId, isRenewal = false } = await request.json();

    if (!targetPlan || !PLAN_HIERARCHY.includes(targetPlan)) {
      return NextResponse.json({ error: 'Invalid target plan' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const result = await upgradeUserPlan(userId, userType, targetPlan, sessionId, isRenewal);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Upgrade plan API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upgrade plan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') || 'dealer';

    // Get current user plan
    const userCollection = userType === 'dealer' ? 'dealers' : 'users';
    let userDoc = await adminDb.collection(userCollection).doc(userId).get();

    if (!userDoc.exists && userType === 'dealer') {
      userDoc = await adminDb.collection('users').doc(userId).get();
    }

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentPlan = userData?.planName;

    if (!currentPlan) {
      return NextResponse.json({
        currentPlan: null,
        availableUpgrades: PLAN_HIERARCHY.slice()
      });
    }

    const availableUpgrades = getAvailableUpgrades(currentPlan);
    const availableRenewals = getAvailableRenewalPlans(currentPlan);

    return NextResponse.json({
      currentPlan,
      availableUpgrades,
      availableRenewals,
      planHierarchy: PLAN_HIERARCHY
    });

  } catch (error) {
    console.error('Get upgrade options error:', error);
    return NextResponse.json(
      { error: 'Failed to get upgrade options' },
      { status: 500 }
    );
  }
}
