# Stripe Coupon Setup Instructions

To complete the payment plan integration, you need to create the following coupons in your Stripe dashboard:

## Step 1: Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** > **Coupons**
3. Click **Create coupon**

## Step 2: Create Each Coupon

Create the following coupons exactly as specified:

### 1. Basic Plan Coupon
- **ID**: `BASIC25`
- **Type**: Fixed amount
- **Amount**: £25.00 GBP
- **Duration**: Once
- **Name**: "Basic Plan Discount"

### 2. Private Gold Coupon
- **ID**: `PRIVATEGOLD20`
- **Type**: Fixed amount
- **Amount**: £20.00 GBP
- **Duration**: Once
- **Name**: "Private Gold Discount"

### 3. Traders Silver Coupon
- **ID**: `TRADERSILVER100`
- **Type**: Fixed amount
- **Amount**: £100.00 GBP
- **Duration**: Once
- **Name**: "Traders Silver Discount"

### 4. Traders Gold Coupon
- **ID**: `TRADERGOLD200`
- **Type**: Fixed amount
- **Amount**: £200.00 GBP
- **Duration**: Once
- **Name**: "Traders Gold Discount"

### 5. Traders Platinum Coupon
- **ID**: `TRADERPLATINUM250`
- **Type**: Fixed amount
- **Amount**: £250.00 GBP
- **Duration**: Once
- **Name**: "Traders Platinum Discount"

## Step 3: Create Promotion Codes (Optional)
For each coupon, you can also create a promotion code that customers can enter manually:

1. Click on the coupon you created
2. Click **Create promotion code**
3. Use the same code as the coupon ID
4. Set **Active** to true
5. Leave other settings as default

## Payment Flow
After setting up these coupons:

1. **Basic Plan**: £25.00 - £25.00 coupon = £0.00 (Free)
2. **Private Gold**: £25.00 - £20.00 coupon = £5.00
3. **Traders Silver**: £100.00 - £100.00 coupon = £0.00 (Free)
4. **Traders Gold**: £250.00 - £200.00 coupon = £50.00
5. **Traders Platinum**: £350.00 - £250.00 coupon = £100.00

Customers will be redirected to Stripe checkout where they can enter the coupon code or see the discount automatically applied.

## Testing
Use Stripe's test environment first:
1. Create test coupons with the same IDs
2. Use test card numbers like `4242 4242 4242 4242`
3. Test each plan to ensure coupons work correctly

## Notes
- Coupon IDs are case-sensitive and must match exactly
- Fixed amount coupons work better than percentage for this use case
- Duration "Once" means the coupon can only be used once per customer
- You can set usage limits if needed in the Stripe dashboard
