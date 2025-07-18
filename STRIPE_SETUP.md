# Stripe Payment Integration Setup

This guide covers the setup of the Stripe payment integration for payment plans using your existing Firebase Authentication.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Token System Configuration
CLEANUP_SECRET=your_secure_cleanup_secret_here
```

## Authentication System

This integration uses your existing Firebase Authentication system:
- **Frontend**: Uses `useAuth()` hook from `@/hooks/useAuth`
- **Backend**: Verifies Firebase ID tokens using Firebase Admin SDK
- **No NextAuth**: Keeps your current authentication flow unchanged

## Stripe Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Navigate to the Dashboard

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy your Publishable key and Secret key
   - Add them to your `.env.local` file

3. **Create Webhook Endpoint**
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
   - Copy the webhook signing secret and add it to your `.env.local` file

## Features Implemented

### 1. API Routes

- **`/api/stripe/create-checkout`**: Creates Stripe checkout sessions (Firebase Auth protected)
- **`/api/stripe/webhook`**: Handles Stripe webhook events

### 2. Payment Plans Component

- **Firebase Authentication**: Uses your existing `useAuth()` hook
- **ID Token Authentication**: Sends Firebase ID token with API requests
- **Free Plans**: Automatically activated without Stripe
- **Paid Plans**: Redirects to Stripe checkout
- **Loading States**: Shows loading indicators during processing
- **Error Handling**: User-friendly error messages

### 3. Webhook Handling

The webhook handler processes three key events:

- **`checkout.session.completed`**: Updates user/dealer profile with plan details
- **`checkout.session.async_payment_failed`**: Logs failed payments
- **`checkout.session.expired`**: Logs expired sessions

### 4. Metadata Tracking

Each Stripe session includes metadata:
- User ID
- User type (user/dealer)
- Plan name
- Token count
- Plan validity period
- User email

### 5. Database Updates

On successful payment, the system updates the Firestore collection:
- Sets plan name
- Sets token count
- Sets plan expiration date
- Records payment status and details

## Plan Types

The system supports both user and dealer plans with coupon-based pricing:

1. **Basic**: £25 (Free with £25 coupon - BASIC25)
2. **Private Gold**: £25 (£5 with £20 coupon - PRIVATEGOLD20)
3. **Traders Silver**: £100 (Free with £100 coupon - TRADERSILVER100)
4. **Traders Gold**: £250 (£50 with £200 coupon - TRADERGOLD200)
5. **Traders Platinum**: £350 (£100 with £250 coupon - TRADERPLATINUM250)

All plans go through Stripe checkout with pre-configured coupons for discount application.

## Testing

1. **Test Mode**: Use Stripe test keys for development
2. **Test Cards**: Use Stripe's test card numbers
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. **Webhook Testing**: Use Stripe CLI for local webhook testing

## Security Features

- **Firebase Authentication**: All payment operations require valid Firebase ID tokens
- **Token Verification**: Backend verifies Firebase ID tokens using Admin SDK
- **Webhook Verification**: Validates webhook signatures
- **Metadata Validation**: Ensures all required metadata is present
- **Error Handling**: Comprehensive error logging and user feedback

## User Flow

1. User visits `/payment-plans`
2. Selects a plan
3. System checks Firebase authentication status using `useAuth()`
4. All plans: Gets Firebase ID token and sends to API
5. API creates Stripe checkout session with full price and promotion codes enabled
6. User is redirected to Stripe checkout page
7. User can apply the recommended coupon code for discount
8. User completes payment on Stripe (even if £0 after coupon)
9. Webhook receives payment confirmation
10. System updates user profile with plan details
11. User is redirected to success page

## Coupon Setup Required

You need to create coupons in your Stripe dashboard. See `STRIPE_COUPONS_SETUP.md` for detailed instructions on creating:
- BASIC25 (£25 off)
- PRIVATEGOLD20 (£20 off) 
- TRADERSILVER100 (£100 off)
- TRADERGOLD200 (£200 off)
- TRADERPLATINUM250 (£250 off)

## Integration with Existing Auth

This implementation seamlessly integrates with your existing Firebase Auth:
- **No changes** to your current authentication flow
- **Reuses** your existing `useAuth()` hook
- **Maintains** your user/dealer role system
- **Updates** existing Firestore collections (`users` and `dealers`)

## Error Handling

The system handles various error scenarios:
- Unauthenticated users
- Invalid plan selection
- Stripe API errors
- Webhook verification failures
- Database update failures

All errors are logged for debugging and user-friendly messages are displayed to users.
