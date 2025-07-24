import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

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
  console.log('Session metadata:', session.metadata);
  
  const metadata = session.metadata;
  if (!metadata) {
    console.error('No metadata found in session:', session.id);
    return;
  }

  const { userId, userType, planName, tokens, validity } = metadata;
  const isUpgrade = metadata.isUpgrade === 'true';
  const isRenewal = metadata.isRenewal === 'true';
  const currentPlan = metadata.currentPlan || '';

  if (!userId || !userType || !planName || !tokens || !validity) {
    console.error('Missing required metadata:', metadata);
    return;
  }

  console.log(`Processing ${isUpgrade ? 'upgrade' : isRenewal ? 'renewal' : 'plan purchase'} for ${userType} ${userId}: ${planName} (${tokens} tokens, ${validity} days)`);

  // Get current user data to preserve purchase history
  const collection = userType === 'dealer' ? 'dealers' : 'users';

  try {
    // Calculate plan expiration date
    const now = new Date();
    const planExpiration = new Date();
    planExpiration.setDate(planExpiration.getDate() + parseInt(validity));

    // Create purchase record
    const purchaseRecord = {
      planName,
      purchaseDate: admin.firestore.Timestamp.fromDate(now),
      amount: session.amount_total ? session.amount_total / 100 : 0,
      stripeSessionId: session.id,
      tokens: parseInt(tokens),
      validity: parseInt(validity),
      ...(isUpgrade && { upgradeFrom: currentPlan }),
      ...(isRenewal && { isRenewal: true })
    };

    let userRef = adminDb.collection(collection).doc(userId);
    let currentDoc = await userRef.get();
    
    // If dealer document doesn't exist, try users collection as fallback
    if (!currentDoc.exists && userType === 'dealer') {
      userRef = adminDb.collection('users').doc(userId);
      currentDoc = await userRef.get();
    }
    
    const currentData = currentDoc.exists ? currentDoc.data() || {} : {};
    const currentHistory = currentData.purchaseHistory || [];

    // Calculate tokens for upgrades and renewals
    let finalTotalTokens = parseInt(tokens);
    let finalUsedTokens = 0;
    
    if (isUpgrade || isRenewal) {
      // For upgrades/renewals: totalTokens = (currentTotal - currentUsed) + newPlanAllocation
      const currentTotalTokens = currentData.totalTokens || 0;
      const currentUsedTokens = currentData.usedTokens || 0;
      const remainingTokens = Math.max(0, currentTotalTokens - currentUsedTokens);
      
      finalTotalTokens = remainingTokens + parseInt(tokens);
      finalUsedTokens = 0; // Reset to allow full usage
      
      console.log(`Token calculation for ${isUpgrade ? 'upgrade' : 'renewal'}:`, {
        currentTotal: currentTotalTokens,
        currentUsed: currentUsedTokens,
        remainingTokens,
        newPlanAllocation: parseInt(tokens),
        finalTotal: finalTotalTokens
      });
    }

    const updateData = {
      planName: planName,
      planStartDate: admin.firestore.Timestamp.fromDate(now),
      planEndDate: admin.firestore.Timestamp.fromDate(planExpiration),
      totalTokens: finalTotalTokens,
      usedTokens: finalUsedTokens,
      purchaseHistory: [...currentHistory, purchaseRecord],
      lastPaymentStatus: 'completed',
      lastPaymentSessionId: session.id,
      lastPaymentAmount: session.amount_total ? session.amount_total / 100 : 0,
      lastPaymentDate: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    };

    // Update the appropriate collection based on user type
    if (currentDoc.exists) {
      await userRef.update(updateData);
    } else {
      // If document doesn't exist, create it with default fields
      await userRef.set({
        uid: userId,
        email: metadata.userEmail || '',
        createdAt: admin.firestore.Timestamp.fromDate(now),
        ...updateData
      });
    }

    console.log(`Successfully ${isUpgrade ? 'upgraded' : 'updated'} ${userType} ${userId} with plan ${planName}`);
    console.log('Update data applied:', updateData);
  } catch (error) {
    console.error('Error updating user profile after successful payment:', error);
    console.error('Error details:', {
      userId,
      userType,
      planName,
      collectionName: collection,
      sessionId: session.id
    });
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
