import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get Firebase ID token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get active vehicles
    const activeVehiclesSnapshot = await adminDb.collection('vehicles')
      .where('dealerUid', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const activeVehicles = activeVehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      tokenActivatedDate: doc.data().tokenActivatedDate?.toDate().toISOString(),
      tokenExpiryDate: doc.data().tokenExpiryDate?.toDate().toISOString(),
      tokenDeactivatedDate: doc.data().tokenDeactivatedDate?.toDate().toISOString()
    }));

    // Get inactive vehicles
    const inactiveVehiclesSnapshot = await adminDb.collection('inactiveVehicles')
      .where('dealerUid', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const inactiveVehicles = inactiveVehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      tokenActivatedDate: doc.data().tokenActivatedDate?.toDate().toISOString(),
      tokenExpiryDate: doc.data().tokenExpiryDate?.toDate().toISOString(),
      tokenDeactivatedDate: doc.data().tokenDeactivatedDate?.toDate().toISOString()
    }));

    // Only log in development when debugging
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGS === 'true') {
      console.log(`Vehicle data retrieved for dealer ${userId}: ${activeVehicles.length} active, ${inactiveVehicles.length} inactive`);
    }

    return NextResponse.json({
      success: true,
      data: {
        activeVehicles,
        inactiveVehicles,
        totalVehicles: activeVehicles.length + inactiveVehicles.length
      }
    });

  } catch (error) {
    console.error('Get vehicle data error:', error);
    return NextResponse.json(
      { error: 'Failed to get vehicle data' },
      { status: 500 }
    );
  }
}
