import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const VALID_ADDITIONAL_ROLES = ['shop', 'garage'];

export async function POST(request: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Parse request body
    const { uid, role, action } = await request.json();

    // Validate inputs
    if (!uid || !role || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, role, and action' },
        { status: 400 }
      );
    }

    // Verify the user is modifying their own roles or is an admin
    if (decodedToken.uid !== uid && !decodedToken.admin) {
      return NextResponse.json(
        { error: 'Unauthorized to modify other users\' roles' },
        { status: 403 }
      );
    }

    if (!VALID_ADDITIONAL_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ADDITIONAL_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be either "add" or "remove"' },
        { status: 400 }
      );
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentAdditionalRoles = userData?.additionalRoles || [];

    // Prepare updated roles array
    let updatedRoles: string[];
    if (action === 'add') {
      // Add role if it doesn't exist
      updatedRoles = Array.from(new Set([...currentAdditionalRoles, role]));
    } else {
      // Remove role
      updatedRoles = currentAdditionalRoles.filter((r: string) => r !== role);
    }

    // Update Firestore document
    await userRef.update({
      additionalRoles: updatedRoles,
      updatedAt: new Date().toISOString()
    });

    // Update auth custom claims
    const customClaims = {
      ...(await adminAuth.getUser(uid)).customClaims,
      additionalRoles: updatedRoles
    };
    await adminAuth.setCustomUserClaims(uid, customClaims);

    // Add to audit log
    await adminDb.collection('roleAuditLog').add({
      uid,
      action,
      role,
      type: 'additional_role',
      timestamp: new Date().toISOString(),
      updatedBy: decodedToken.email || decodedToken.uid
    });

    return NextResponse.json({
      success: true,
      additionalRoles: updatedRoles
    });
  } catch (error) {
    console.error('Error managing additional roles:', error);
    return NextResponse.json(
      { error: 'Failed to manage additional roles' },
      { status: 500 }
    );
  }
} 