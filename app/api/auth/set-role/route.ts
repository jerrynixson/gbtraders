import { NextResponse } from 'next/server';
import { setUserRole } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Basic request validation
    const { uid, role } = await request.json();

    if (!uid || !role || !['user', 'dealer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Attempt to set the user role
    const result = await setUserRole(uid, role as 'user' | 'dealer');

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to set user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Role successfully updated to ${role}`
    });
  } catch (error) {
    console.error('Error in set-role API:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('does not exist') ? 404 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 