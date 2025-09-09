import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const VALID_ADDITIONAL_ROLES = ['shop', 'garage'];

export async function POST(request: Request) {
  try {
    const { uid, firstName, lastName, email, phone, country, location, role, additionalRoles = [] } = await request.json();

    // Validate required fields
    if (!uid || !firstName || !lastName || !email || !phone || !country || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'dealer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Validate additional roles if provided
    if (additionalRoles.length > 0) {
      const invalidRoles = additionalRoles.filter((r: string) => !VALID_ADDITIONAL_ROLES.includes(r));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { error: `Invalid additional roles: ${invalidRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create user document using Admin SDK
    await adminDb.collection('users').doc(uid).set({
      firstName,
      lastName,
      email,
      phone,
      country,
      location: location || null,
      role,
      additionalRoles,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    return NextResponse.json({ 
      success: true,
      message: 'User document created successfully'
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 