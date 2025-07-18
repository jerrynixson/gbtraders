import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { vehicleId, action } = await request.json();

    if (!vehicleId || !action) {
      return NextResponse.json(
        { error: 'Vehicle ID and action are required' },
        { status: 400 }
      );
    }

    console.log(`Processing ${action} request for vehicle ${vehicleId} by user ${userId}`);

    // Get user plan info from users collection (with fallback logic)
    let userDoc = await adminDb.collection('dealers').doc(userId).get();
    
    if (!userDoc.exists) {
      userDoc = await adminDb.collection('users').doc(userId).get();
    }

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    if (action === 'activate') {
      // Check if user has available tokens
      const totalTokens = userData?.totalTokens || 0;
      const usedTokens = userData?.usedTokens || 0;
      const availableTokens = totalTokens - usedTokens;

      if (availableTokens <= 0) {
        return NextResponse.json({
          success: false,
          error: 'No available tokens to activate vehicle'
        });
      }

      // Check if plan is still active
      const planEndDate = userData?.planEndDate?.toDate();
      if (!planEndDate || planEndDate < new Date()) {
        return NextResponse.json({
          success: false,
          error: 'Plan has expired'
        });
      }

      // Try to find vehicle in either vehicles or inactiveVehicles collection
      let vehicleDoc = await adminDb.collection('vehicles').doc(vehicleId).get();
      let vehicleData = vehicleDoc.data();
      let isFromInactive = false;

      if (!vehicleDoc.exists) {
        // Check in inactive vehicles collection
        vehicleDoc = await adminDb.collection('inactiveVehicles').doc(vehicleId).get();
        vehicleData = vehicleDoc.data();
        isFromInactive = true;
      }

      if (!vehicleDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Vehicle not found' },
          { status: 404 }
        );
      }

      // Check if token has expired for inactive vehicles
      if (isFromInactive && vehicleData?.tokenExpiryDate) {
        const tokenExpiryDate = vehicleData.tokenExpiryDate.toDate();
        if (tokenExpiryDate < new Date()) {
          return NextResponse.json({
            success: false,
            error: 'Vehicle token has expired. Please contact support to renew your plan.'
          });
        }
      }

      // Update vehicle status to active and increment used tokens
      const batch = adminDb.batch();

      if (isFromInactive) {
        // Move from inactive to active collection
        const activeVehicleRef = adminDb.collection('vehicles').doc(vehicleId);
        const inactiveVehicleRef = adminDb.collection('inactiveVehicles').doc(vehicleId);
        
        batch.set(activeVehicleRef, {
          ...vehicleData,
          tokenStatus: 'active',
          tokenActivatedDate: new Date(),
          tokenExpiryDate: planEndDate,
          updatedAt: new Date()
        });
        
        batch.delete(inactiveVehicleRef);
      } else {
        // Update vehicle in active collection
        const vehicleRef = adminDb.collection('vehicles').doc(vehicleId);
        batch.update(vehicleRef, {
          tokenStatus: 'active',
          tokenActivatedDate: new Date(),
          tokenExpiryDate: planEndDate,
          updatedAt: new Date()
        });
      }

      // Increment used tokens count
      const userRef = userDoc.ref;
      batch.update(userRef, {
        usedTokens: usedTokens + 1,
        updatedAt: new Date()
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: 'Vehicle token activated successfully'
      });

    } else if (action === 'deactivate') {
      // Get current vehicle status
      const vehicleDoc = await adminDb.collection('vehicles').doc(vehicleId).get();
      
      if (!vehicleDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Vehicle not found' },
          { status: 404 }
        );
      }

      const vehicleData = vehicleDoc.data();
      
      // Only deactivate if currently active
      if (vehicleData?.tokenStatus !== 'active') {
        return NextResponse.json({
          success: false,
          error: 'Vehicle token is not currently active'
        });
      }

      // Update vehicle status to inactive and decrement used tokens
      const batch = adminDb.batch();

      // Move vehicle to inactive collection
      const inactiveVehicleRef = adminDb.collection('inactiveVehicles').doc(vehicleId);
      const vehicleRef = adminDb.collection('vehicles').doc(vehicleId);
      
      batch.set(inactiveVehicleRef, {
        ...vehicleData,
        tokenStatus: 'inactive',
        deactivationReason: 'user_choice',
        deactivatedAt: new Date(),
        updatedAt: new Date()
      });
      
      batch.delete(vehicleRef);

      // Decrement used tokens count
      const userRef = userDoc.ref;
      const currentUsedTokens = userData?.usedTokens || 0;
      batch.update(userRef, {
        usedTokens: Math.max(0, currentUsedTokens - 1),
        updatedAt: new Date()
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: 'Vehicle token deactivated successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "activate" or "deactivate"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing vehicle token action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
