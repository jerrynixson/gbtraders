import { auth } from "@/lib/firebase";

export interface DealerLocation {
  lat: number;
  long: number;
  addressLines: [string, string, string];
}

export interface DealerProfile {
  businessName: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  description: string;
  location: DealerLocation;
  businessHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: string[];
  dealerLogoUrl?: string;
  dealerBannerUrl?: string;
  updatedAt?: string;
}

/**
 * Fetches existing dealer profile if it exists
 */
export async function getDealerProfile(uid: string): Promise<DealerProfile | null> {
  // Static cache to avoid duplicate requests in the same session
  if (typeof window !== 'undefined') {
    const cachedProfile = (window as any).__dealerProfiles?.[uid];
    const cachedTime = (window as any).__dealerProfileTimes?.[uid];
    
    // Use cache if less than 5 minutes old
    if (cachedProfile && cachedTime && (Date.now() - cachedTime) < 300000) {
      return cachedProfile === 'NOT_FOUND' ? null : cachedProfile;
    }
  }
  
  try {
    // Get the ID token
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('User must be authenticated to fetch dealer profile');
    }

    // Call the API endpoint
    const response = await fetch('/api/dealer/profile', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Profile doesn't exist yet, which is an expected case - return null
        // Cache the "not found" result to avoid future API calls
        if (typeof window !== 'undefined') {
          if (!(window as any).__dealerProfiles) (window as any).__dealerProfiles = {};
          if (!(window as any).__dealerProfileTimes) (window as any).__dealerProfileTimes = {};
          (window as any).__dealerProfiles[uid] = 'NOT_FOUND';
          (window as any).__dealerProfileTimes[uid] = Date.now();
        }
        return null;
      }
      throw new Error('Failed to fetch dealer profile');
    }

    const profileData = await response.json();
    
    // Cache the result to avoid future API calls
    if (typeof window !== 'undefined') {
      if (!(window as any).__dealerProfiles) (window as any).__dealerProfiles = {};
      if (!(window as any).__dealerProfileTimes) (window as any).__dealerProfileTimes = {};
      (window as any).__dealerProfiles[uid] = profileData;
      (window as any).__dealerProfileTimes[uid] = Date.now();
    }
    
    return profileData;
  } catch (error) {
    // Only log real errors, not 404s which are expected for new users
    if (!(error instanceof Error && error.message.includes('404'))) {
      // Suppress console errors in production
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching dealer profile:', error);
      }
    }
    
    // Cache the error to avoid future API calls
    if (typeof window !== 'undefined') {
      if (!(window as any).__dealerProfiles) (window as any).__dealerProfiles = {};
      if (!(window as any).__dealerProfileTimes) (window as any).__dealerProfileTimes = {};
      (window as any).__dealerProfiles[uid] = 'NOT_FOUND';
      (window as any).__dealerProfileTimes[uid] = Date.now();
    }
    
    return null;
  }
}

/**
 * Submits or updates a dealer's profile
 */
export async function submitDealerProfile(
  profile: Omit<DealerProfile, 'updatedAt'>,
  logoFile?: File | null,
  bannerFile?: File | null
): Promise<void> {
  // Check authentication
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to submit dealer profile');
  }

  try {
    // Get the ID token
    const idToken = await currentUser.getIdToken();

    // Create form data
    const formData = new FormData();
    formData.append('profile', JSON.stringify(profile));
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    // Call the API endpoint
    const response = await fetch('/api/dealer/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to submit dealer profile');
    }
  } catch (error) {
    console.error('Error submitting dealer profile:', error);
    throw error;
  }
} 