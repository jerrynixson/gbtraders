import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface Plan {
  name: string;
  price: string;
  originalPrice: string;
  couponCode: string;
  couponDiscount: string;
  token: number;
  validity: number;
}

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
    const userEmail = decodedToken.email;

    const { planName } = await request.json();

    if (!planName) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // Get user details from Firestore - check dealers first, then users
    let userType: 'user' | 'dealer' = 'user';
    let userData = null;

    try {
      // First check if user is a dealer (more specific query)
      const dealerDoc = await adminDb.collection('dealers').doc(userId).get();
      
      if (dealerDoc.exists) {
        userType = 'dealer';
        userData = dealerDoc.data();
      } else {
        // Only check users collection if not found in dealers
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          userType = 'user';
          userData = userDoc.data();
        } else {
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Define plans with pricing
    const plans: Record<string, Plan> = {
      "Basic": {
        name: "Basic",
        price: "25.00",
        originalPrice: "25.00",
        couponCode: "BASIC25",
        couponDiscount: "25.00",
        token: 1,
        validity: 7
      },
      "Private Gold": {
        name: "Private Gold",
        price: "25.00",
        originalPrice: "25.00",
        couponCode: "PRIVATEGOLD20",
        couponDiscount: "20.00",
        token: 1,
        validity: 30
      },
      "Traders Silver": {
        name: "Traders Silver",
        price: "100.00",
        originalPrice: "100.00",
        couponCode: "TRADERSILVER100",
        couponDiscount: "100.00",
        token: 5,
        validity: 10
      },
      "Traders Gold": {
        name: "Traders Gold",
        price: "250.00",
        originalPrice: "250.00",
        couponCode: "TRADERGOLD200",
        couponDiscount: "200.00",
        token: 15,
        validity: 30
      },
      "Traders Platinum": {
        name: "Traders Platinum",
        price: "350.00",
        originalPrice: "350.00",
        couponCode: "TRADERPLATINUM250",
        couponDiscount: "250.00",
        token: 30,
        validity: 30
      }
    };

    const selectedPlan = plans[planName];
    
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Calculate the discounted price
    const originalPrice = parseFloat(selectedPlan.price);
    const discountAmount = parseFloat(selectedPlan.couponDiscount);
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    const priceInCents = Math.round(finalPrice * 100);
    
    // Create checkout session with the final discounted price
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${selectedPlan.name} - Special Offer`,
              description: `${selectedPlan.token} listings for ${selectedPlan.validity} days (Originally £${originalPrice}, Save £${discountAmount})`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`
        : `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment-plans?cancelled=true`
        : `${request.nextUrl.origin}/payment-plans?cancelled=true`,
      allow_promotion_codes: false, // Disable since we're applying discount directly
      metadata: {
        userId: userId,
        userType: userType,
        planName: selectedPlan.name,
        tokens: selectedPlan.token.toString(),
        validity: selectedPlan.validity.toString(),
        userEmail: userEmail || '',
        originalPrice: originalPrice.toString(),
        discountApplied: discountAmount.toString(),
        finalPrice: finalPrice.toString(),
      },
      customer_email: userEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      sessionUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
