import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, firstName, lastName, email, country, role } = body;

    // Validate required fields
    if (!uid || !firstName || !lastName || !email || !country || !role) {
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

    // Create user document using Admin SDK
    await adminDb.collection('users').doc(uid).set({
      firstName,
      lastName,
      email,
      country,
      role,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    return NextResponse.json({ 
      success: true,
      message: 'User document created successfully'
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    
    // Ensure we always return a valid JSON response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
} 