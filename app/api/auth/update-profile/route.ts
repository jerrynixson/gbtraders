import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, firstName, lastName, country, role, location } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      country,
      role,
      updatedAt: new Date(),
    };

    // Add location if provided
    if (location) {
      updateData.location = location;
    }

    // Update user profile in Firestore using the existing adminDb instance
    await adminDb.collection('users').doc(uid).update(updateData);

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
} 