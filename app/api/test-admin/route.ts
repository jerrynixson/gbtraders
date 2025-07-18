import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Test admin auth
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No auth token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Test admin firestore
    const testDoc = await adminDb.collection('test').doc('admin-test').get();
    
    return NextResponse.json({
      success: true,
      message: 'Admin SDK is working correctly',
      userId: decodedToken.uid,
      timestamp: new Date().toISOString(),
      firestoreConnected: true
    });

  } catch (error) {
    console.error('Admin SDK test error:', error);
    return NextResponse.json(
      { 
        error: 'Admin SDK test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
