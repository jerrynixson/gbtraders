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
        return null;
      }
      throw new Error('Failed to fetch dealer profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dealer profile:', error);
    throw new Error('Failed to fetch dealer profile');
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