import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
const adminDb = getFirestore()

export async function POST(request: Request) {
  try {
    const { sessionCookie } = await request.json()

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session cookie provided' }, { status: 401 })
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    
    // Get the user's role from roleAuditLog collection
    const roleAuditLogQuery = await adminDb
      .collection('roleAuditLog')
      .where('uid', '==', decodedClaims.uid)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    if (roleAuditLogQuery.empty) {
      return NextResponse.json({ error: 'No role found' }, { status: 403 })
    }

    const latestRole = roleAuditLogQuery.docs[0].data().role
    
    return NextResponse.json({ role: latestRole })
  } catch (error) {
    console.error('Error checking role:', error)
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
} 