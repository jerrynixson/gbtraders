import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function DELETE(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Delete user profile from Firestore
    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 