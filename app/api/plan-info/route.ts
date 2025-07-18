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
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') || 'dealer';

    // Get user plan info using admin SDK
    const collection = userType === 'dealer' ? 'dealers' : 'users';
    let userDoc = await adminDb.collection(collection).doc(userId).get();

    // If dealer document doesn't exist, try users collection as fallback
    if (!userDoc.exists && userType === 'dealer') {
      userDoc = await adminDb.collection('users').doc(userId).get();
    }

    if (!userDoc.exists) {
      return NextResponse.json({
        success: true,
        planInfo: null
      });
    }

    const userData = userDoc.data();
    
    const planInfo = {
      userId: userId,
      planName: userData?.planName,
      planPrice: userData?.planPrice || 0,
      planStartDate: userData?.planStartDate?.toDate().toISOString(),
      planEndDate: userData?.planEndDate?.toDate().toISOString(),
      totalTokens: userData?.totalTokens || 0,
      usedTokens: userData?.usedTokens || 0,
      purchaseHistory: (userData?.purchaseHistory || []).map((record: any) => ({
        ...record,
        purchaseDate: record.purchaseDate?.toDate().toISOString()
      })),
      lastPaymentStatus: userData?.lastPaymentStatus,
      lastPaymentDate: userData?.lastPaymentDate?.toDate().toISOString()
    };

    return NextResponse.json({
      success: true,
      planInfo
    });

  } catch (error) {
    console.error('Get plan info error:', error);
    return NextResponse.json(
      { error: 'Failed to get plan information' },
      { status: 500 }
    );
  }
}
