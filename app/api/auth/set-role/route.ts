import { NextResponse } from 'next/server';
import { setUserRole } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, role } = await request.json();

    if (!uid || !role || !['user', 'dealer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    await setUserRole(uid, role as 'user' | 'dealer');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in set-role API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 