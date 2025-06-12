import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();

export default admin;

interface UserRoleData {
  role: 'user' | 'dealer';
  updatedAt: admin.firestore.Timestamp;
  updatedBy: string;
}

export const setUserRole = async (uid: string, role: 'user' | 'dealer') => {
  try {
    // Start a batch write
    const batch = adminDb.batch();

    // Reference to the user document
    const userRef = adminDb.collection('users').doc(uid);

    // Get the current user document
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User document does not exist');
    }

    // Prepare role update data
    const roleData: UserRoleData = {
      role,
      updatedAt: admin.firestore.Timestamp.now(),
      updatedBy: 'system'
    };

    // Add role update to user document
    batch.update(userRef, {
      ...roleData,
      previousRole: userDoc.data()?.role || null
    });

    // Add role update to audit log
    const auditRef = adminDb.collection('roleAuditLog').doc();
    batch.set(auditRef, {
      uid,
      ...roleData,
      previousRole: userDoc.data()?.role || null,
      timestamp: admin.firestore.Timestamp.now()
    });

    // Set custom claims in Auth
    await adminAuth.setCustomUserClaims(uid, { role });

    // Commit the batch
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error in setUserRole:', error);
    // Rethrow with a clean error message
    throw new Error(error instanceof Error ? error.message : 'Failed to set user role');
  }
}; 