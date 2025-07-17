import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Stripe webhook event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionFailed(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Payment succeeded for session:', session.id);
  
  const metadata = session.metadata;
  if (!metadata) {
    console.error('No metadata found in session:', session.id);
    return;
  }

  const { userId, userType, planName, tokens, validity } = metadata;

  if (!userId || !userType || !planName || !tokens || !validity) {
    console.error('Missing required metadata:', metadata);
    return;
  }

  try {
    // Calculate plan expiration date
    const planExpiration = new Date();
    planExpiration.setDate(planExpiration.getDate() + parseInt(validity));

    const updateData = {
      plan: planName,
      tokens: parseInt(tokens),
      planExpiration: planExpiration,
      updatedAt: new Date(),
      lastPaymentStatus: 'completed',
      lastPaymentSessionId: session.id,
      lastPaymentAmount: session.amount_total ? session.amount_total / 100 : 0,
      lastPaymentDate: new Date(),
    };

    // Update the appropriate collection based on user type
    const collection = userType === 'dealer' ? 'dealers' : 'users';
    await adminDb.collection(collection).doc(userId).update(updateData);

    console.log(`Successfully updated ${userType} ${userId} with plan ${planName}`);
  } catch (error) {
    console.error('Error updating user profile after successful payment:', error);
    throw error;
  }
}

async function handleCheckoutSessionFailed(session: Stripe.Checkout.Session) {
  console.log('Payment failed for session:', session.id);
  
  const metadata = session.metadata;
  if (!metadata) {
    console.error('No metadata found in failed session:', session.id);
    return;
  }

  const { userId, userType } = metadata;

  if (!userId || !userType) {
    console.error('Missing user info in failed payment metadata:', metadata);
    return;
  }

  try {
    const updateData = {
      lastPaymentStatus: 'failed',
      lastPaymentSessionId: session.id,
      lastPaymentDate: new Date(),
      paymentFailureReason: 'async_payment_failed',
    };

    const collection = userType === 'dealer' ? 'dealers' : 'users';
    await adminDb.collection(collection).doc(userId).update(updateData);

    console.log(`Updated ${userType} ${userId} with failed payment status`);
  } catch (error) {
    console.error('Error updating user profile after failed payment:', error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Payment session expired:', session.id);
  
  const metadata = session.metadata;
  if (!metadata) {
    console.error('No metadata found in expired session:', session.id);
    return;
  }

  const { userId, userType } = metadata;

  if (!userId || !userType) {
    console.error('Missing user info in expired session metadata:', metadata);
    return;
  }

  try {
    const updateData = {
      lastPaymentStatus: 'expired',
      lastPaymentSessionId: session.id,
      lastPaymentDate: new Date(),
      paymentFailureReason: 'session_expired',
    };

    const collection = userType === 'dealer' ? 'dealers' : 'users';
    await adminDb.collection(collection).doc(userId).update(updateData);

    console.log(`Updated ${userType} ${userId} with expired session status`);
  } catch (error) {
    console.error('Error updating user profile after session expiry:', error);
    throw error;
  }
}
