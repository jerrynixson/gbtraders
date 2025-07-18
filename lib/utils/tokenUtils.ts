import { tokenRepository } from '@/lib/db/repositories/tokenRepository';

/**
 * Plan configuration with token and validity information
 */
export const PLAN_CONFIGS = {
  "Basic": {
    name: "Basic",
    tokens: 1,
    validity: 7, // days
    price: 25.00,
    couponCode: "BASIC25",
    couponDiscount: 25.00
  },
  "Private Gold": {
    name: "Private Gold",
    tokens: 1,
    validity: 30,
    price: 25.00,
    couponCode: "PRIVATEGOLD20",
    couponDiscount: 20.00
  },
  "Traders Silver": {
    name: "Traders Silver",
    tokens: 5,
    validity: 10,
    price: 100.00,
    couponCode: "TRADERSILVER100",
    couponDiscount: 100.00
  },
  "Traders Gold": {
    name: "Traders Gold",
    tokens: 15,
    validity: 30,
    price: 250.00,
    couponCode: "TRADERGOLD200",
    couponDiscount: 200.00
  },
  "Traders Platinum": {
    name: "Traders Platinum",
    tokens: 30,
    validity: 30,
    price: 350.00,
    couponCode: "TRADERPLATINUM250",
    couponDiscount: 250.00
  }
} as const;

export type PlanName = keyof typeof PLAN_CONFIGS;

/**
 * Check if a user can create a new listing
 */
export async function canCreateListing(
  userId: string,
  userType: 'user' | 'dealer' = 'dealer'
): Promise<{
  canCreate: boolean;
  reason?: string;
  availableTokens: number;
  planInfo: any;
}> {
  const availability = await tokenRepository.checkTokenAvailability(userId, userType);
  
  if (!availability.hasActivePlan) {
    return {
      canCreate: false,
      reason: availability.planExpired ? 'plan_expired' : 'no_plan',
      availableTokens: 0,
      planInfo: availability.planInfo
    };
  }

  if (!availability.hasAvailableTokens) {
    return {
      canCreate: false,
      reason: 'no_tokens',
      availableTokens: availability.availableTokens,
      planInfo: availability.planInfo
    };
  }

  return {
    canCreate: true,
    availableTokens: availability.availableTokens,
    planInfo: availability.planInfo
  };
}

/**
 * Get user-friendly error messages for token/plan issues
 */
export function getTokenErrorMessage(reason?: string): string {
  switch (reason) {
    case 'plan_expired':
      return 'Your plan has expired. Please renew your plan to create new listings.';
    case 'no_plan':
      return 'You need an active plan to create listings. Please choose a plan to get started.';
    case 'no_tokens':
      return 'You have used all your available tokens. Please upgrade your plan or deactivate some listings.';
    default:
      return 'Unable to create listing. Please contact support.';
  }
}

/**
 * Format plan expiry date for display
 */
export function formatPlanExpiry(date: Date): string {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Calculate token usage percentage
 */
export function calculateTokenUsage(usedTokens: number, totalTokens: number): number {
  if (totalTokens === 0) return 0;
  return Math.round((usedTokens / totalTokens) * 100);
}

/**
 * Get plan status color for UI
 */
export function getPlanStatusColor(planInfo: any): {
  bg: string;
  text: string;
  border: string;
} {
  if (!planInfo?.planEndDate) {
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200'
    };
  }

  const now = new Date();
  const daysUntilExpiry = Math.ceil((planInfo.planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    };
  } else if (daysUntilExpiry <= 3) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    };
  } else {
    return {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    };
  }
}

/**
 * Get token status indicator for listings
 */
export function getTokenStatusIndicator(
  tokenStatus: 'active' | 'inactive',
  tokenExpiryDate?: Date
): {
  color: string;
  label: string;
  icon: string;
} {
  if (tokenStatus === 'active') {
    return {
      color: 'text-green-600',
      label: 'Active',
      icon: '●'
    };
  } else {
    // Check if token is expired for inactive vehicles
    if (tokenExpiryDate && tokenExpiryDate < new Date()) {
      return {
        color: 'text-red-400',
        label: 'Expired',
        icon: '⊗'
      };
    }
    return {
      color: 'text-gray-400',
      label: 'Inactive',
      icon: '○'
    };
  }
}

/**
 * Daily cleanup function to process expired plans
 */
export async function processDailyTokenCleanup(): Promise<void> {
  try {
    await tokenRepository.processExpiredPlans();
    console.log('Daily token cleanup completed successfully');
  } catch (error) {
    console.error('Daily token cleanup failed:', error);
    throw error;
  }
}
