import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
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
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if the session belongs to the current user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to current user' },
        { status: 403 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    const metadata = session.metadata;
    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata found in session' },
        { status: 400 }
      );
    }

    const { userType, planName, tokens, validity } = metadata;
    const isUpgrade = metadata.isUpgrade === 'true';
    const isRenewal = metadata.isRenewal === 'true';

    if (!userType || !planName || !tokens || !validity) {
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      );
    }

    // Update user plan using admin SDK directly
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
        stripeSessionId: sessionId,
        tokens: parseInt(tokens),
        validity: parseInt(validity),
        ...(isUpgrade && { upgradeFrom: metadata.currentPlan }),
        ...(isRenewal && { isRenewal: true })
      };

      // Get current user data to preserve purchase history
      const collection = userType === 'dealer' ? 'dealers' : 'users';
      let userRef = adminDb.collection(collection).doc(userId);
      let currentDoc = await userRef.get();
      
      // If dealer document doesn't exist, try users collection as fallback
      if (!currentDoc.exists && userType === 'dealer') {
        userRef = adminDb.collection('users').doc(userId);
        currentDoc = await userRef.get();
      }
      
      const currentData = currentDoc.exists ? currentDoc.data() || {} : {};
      const currentHistory = currentData.purchaseHistory || [];

      console.log(`Updating ${userType} ${userId} in collection ${collection}, document exists: ${currentDoc.exists}`);

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
        lastPaymentSessionId: sessionId,
        lastPaymentAmount: session.amount_total ? session.amount_total / 100 : 0,
        lastPaymentDate: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now)
      };

      // Update the appropriate collection based on user type
      if (currentDoc.exists) {
        await userRef.update(updateData);
      } else {
        // If user document doesn't exist, create it
        await userRef.set({
          uid: userId,
          email: decodedToken.email,
          createdAt: admin.firestore.Timestamp.fromDate(now),
          ...updateData
        });
      }

      console.log(`Successfully updated ${userType} ${userId} with plan ${planName}`);
    } catch (updateError) {
      console.error('Error updating user plan:', updateError);
      console.error('Update details:', {
        userId,
        userType,
        planName,
        collection: userType === 'dealer' ? 'dealers' : 'users'
      });
      throw new Error('Failed to update user plan');
    }

    // Get updated plan info using admin SDK
    const collection = userType === 'dealer' ? 'dealers' : 'users';
    const userDoc = await adminDb.collection(collection).doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const updatedPlanInfo = userData ? {
      uid: userId,
      planName: userData.planName,
      planStartDate: userData.planStartDate?.toDate(),
      planEndDate: userData.planEndDate?.toDate(),
      totalTokens: userData.totalTokens || 0,
      usedTokens: userData.usedTokens || 0,
      purchaseHistory: (userData.purchaseHistory || []).map((record: any) => ({
        ...record,
        purchaseDate: record.purchaseDate?.toDate()
      })),
      lastPaymentStatus: userData.lastPaymentStatus,
      lastPaymentDate: userData.lastPaymentDate?.toDate()
    } : null;

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully',
      planInfo: updatedPlanInfo
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
