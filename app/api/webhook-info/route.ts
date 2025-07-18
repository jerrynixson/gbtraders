import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get Firebase ID token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Return webhook configuration info
    return NextResponse.json({
      webhookEndpoint: `${request.nextUrl.origin}/api/stripe/webhook`,
      webhookEvents: [
        'checkout.session.completed',
        'checkout.session.async_payment_failed',
        'checkout.session.expired'
      ],
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretConfigured: !!process.env.STRIPE_SECRET_KEY,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook info error:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}
