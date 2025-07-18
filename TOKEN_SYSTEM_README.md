# Token-Based Vehicle Listing System

## Overview

This document describes the comprehensive token-based vehicle listing system implemented for the GB Traders platform. The system manages vehicle listings through a token-based approach where users purchase plans that include a specific number of tokens, and each active listing consumes one token.

## Key Features

### 1. Plan-Based Token System
- **Token Allocation**: Each plan includes a specific number of tokens
- **Token Usage**: Each active vehicle listing consumes 1 token
- **Plan Expiration**: Plans have validity periods after which they expire
- **Automatic Cleanup**: Expired plans automatically deactivate associated vehicles

### 2. Database Schema

#### User/Dealer Collections Enhancement
```typescript
{
  // ... existing fields
  planName?: string;              // Current active plan name
  planStartDate?: Date;           // When plan was activated
  planEndDate?: Date;             // When plan expires
  totalTokens: number;            // Total tokens allowed by plan
  usedTokens: number;             // Currently used tokens
  purchaseHistory: PurchaseRecord[]; // History of plan purchases
  lastPaymentStatus?: string;     // Last payment status
  lastPaymentDate?: Date;         // Last payment date
}
```

#### Vehicle Collection Enhancement
```typescript
{
  // ... existing vehicle fields
  tokenStatus: 'active' | 'inactive';    // Token usage status
  tokenActivatedDate?: Date;              // When token was activated
  tokenExpiryDate?: Date;                 // When token expires
  deactivationReason?: string;            // Why vehicle was deactivated
}
```

#### Inactive Vehicles Collection
- **Purpose**: Stores vehicles that are not using tokens
- **Fields**: Same as vehicle collection plus deactivation information
- **Usage**: Vehicles moved here when deactivated or plan expires

### 3. Plan Configuration

```typescript
const PLAN_CONFIGS = {
  "Basic": { tokens: 1, validity: 7, price: 25.00 },
  "Private Gold": { tokens: 1, validity: 30, price: 25.00 },
  "Traders Silver": { tokens: 5, validity: 10, price: 100.00 },
  "Traders Gold": { tokens: 15, validity: 30, price: 250.00 },
  "Traders Platinum": { tokens: 30, validity: 30, price: 350.00 }
}
```

## Implementation Components

### 1. Token Repository (`lib/db/repositories/tokenRepository.ts`)
- **Core Functions**:
  - `getUserPlanInfo()` - Get user's current plan details
  - `updateUserPlan()` - Update plan after payment
  - `checkTokenAvailability()` - Check if user can create listings
  - `activateVehicleToken()` - Activate a token for a vehicle
  - `deactivateVehicleToken()` - Deactivate a vehicle token
  - `getDealerAllVehicles()` - Get all vehicles (active/inactive)
  - `processExpiredPlans()` - Daily cleanup of expired plans

### 2. Token Utilities (`lib/utils/tokenUtils.ts`)
- **Helper Functions**:
  - `canCreateListing()` - Check listing creation eligibility
  - `getTokenErrorMessage()` - User-friendly error messages
  - `formatPlanExpiry()` - Format expiry dates for display
  - `calculateTokenUsage()` - Calculate usage percentage
  - `getPlanStatusColor()` - UI color helpers

### 3. UI Components

#### PlanInfoSection (`components/dashboard/PlanInfoSection.tsx`)
- Displays current plan information
- Shows token usage with progress bar
- Plan expiry warnings
- Renewal/upgrade buttons

#### TokenizedVehicleCard (`components/dashboard/TokenizedVehicleCard.tsx`)
- Enhanced vehicle listing card
- Token status indicators
- Activate/deactivate controls
- Visual differentiation between active/inactive

### 4. Enhanced Dashboard (`app/dashboard/page.tsx`)
- **Features**:
  - Plan information section
  - Token usage statistics
  - Enhanced vehicle filtering (status + token status)
  - Real-time token availability checking
  - Bulk vehicle management

### 5. Enhanced Add Vehicle Form (`components/add-listing/AddVehicleForm.tsx`)
- **Features**:
  - Pre-submission token availability check
  - User alerts for token status
  - Automatic token activation on creation
  - Disabled form when no tokens available

### 6. Stripe Integration Enhancement (`app/api/stripe/webhook/route.ts`)
- **Features**:
  - Store complete plan details after payment
  - Calculate and store plan expiry dates
  - Maintain purchase history
  - Set token counts based on purchased plan

## User Flow

### 1. Plan Purchase
1. User visits `/payment-plans`
2. Selects a plan and completes Stripe checkout
3. Webhook updates user document with plan details
4. User redirected to dashboard with active plan

### 2. Vehicle Listing Creation
1. User clicks "Add New Listing"
2. System checks token availability
3. If available, form is enabled; if not, user sees upgrade prompt
4. On successful creation, vehicle gets a token automatically
5. Vehicle becomes visible to public immediately

### 3. Token Management
1. Dashboard shows all vehicles with token status
2. Users can activate/deactivate listings manually
3. Active listings are visible to public
4. Inactive listings are hidden but preserved

### 4. Plan Expiration
1. Daily cleanup job runs automatically
2. Expired plans are identified
3. All active vehicles for expired users are deactivated
4. Vehicles moved to inactive collection
5. Users notified to renew plans

## API Endpoints

### 1. Daily Cleanup (`/api/cleanup/daily`)
- **Method**: POST
- **Purpose**: Process expired plans and deactivate vehicles
- **Authentication**: Bearer token required
- **Usage**: Should be called daily by cron job

### 2. Enhanced Stripe Webhook (`/api/stripe/webhook`)
- **Events Handled**:
  - `checkout.session.completed` - Store plan details
  - `checkout.session.failed` - Log failed payments
  - `checkout.session.expired` - Log expired sessions

## Security Features

### 1. Authentication
- All operations require valid Firebase authentication
- Token operations verify user ownership
- API endpoints protected with proper authorization

### 2. Data Validation
- Plan validity checked before token operations
- Token availability verified before vehicle creation
- Automatic cleanup prevents stale data

### 3. Error Handling
- Comprehensive error messages for users
- Graceful fallbacks for failed operations
- Detailed logging for debugging

## Monitoring and Maintenance

### 1. Daily Cleanup
- Automated via `/api/cleanup/daily` endpoint
- Should be scheduled to run daily (suggested: 2 AM UTC)
- Monitors expired plans and processes accordingly

### 2. Logging
- All token operations are logged
- Payment webhook events are tracked
- Error conditions are captured for debugging

### 3. Metrics to Monitor
- Token utilization rates per plan
- Plan conversion and renewal rates
- Vehicle activation/deactivation patterns
- Payment failure rates

## Environment Variables Required

```bash
# Existing variables
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New variable for cleanup service
CLEANUP_SECRET=your-secure-cleanup-secret
```

## Deployment Considerations

### 1. Database Migration
- No breaking changes to existing data
- New fields are optional and have defaults
- Existing vehicles default to inactive token status

### 2. Cron Job Setup
```bash
# Example cron job (daily at 2 AM)
0 2 * * * curl -X POST -H "Authorization: Bearer YOUR_CLEANUP_SECRET" https://yourdomain.com/api/cleanup/daily
```

### 3. Testing
- Test complete flow in development environment
- Verify Stripe webhook integration
- Test daily cleanup functionality
- Validate UI components with different plan states

## Troubleshooting

### Common Issues
1. **Token not activating**: Check plan validity and token availability
2. **Vehicles not appearing**: Verify token status and public visibility
3. **Plan not updating**: Check Stripe webhook configuration
4. **Daily cleanup failing**: Verify cleanup secret and Firebase permissions

### Support Functions
- Token status can be manually reset via Firebase console
- Plans can be manually extended for customer support
- Vehicle token status can be manually adjusted if needed

## Future Enhancements

1. **Analytics Dashboard**: Track token usage patterns
2. **Bulk Operations**: Allow bulk activation/deactivation
3. **Auto-renewal**: Automatic plan renewal before expiration
4. **Tiered Visibility**: Different visibility levels based on plan type
5. **API Access**: Allow programmatic access for large dealers
