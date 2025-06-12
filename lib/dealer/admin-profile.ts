import { adminDb, adminStorage } from '../firebase-admin';
import { DealerProfile, DealerLocation } from './profile';

/**
 * Check if user has dealer role using admin SDK
 */
export async function checkDealerRoleAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();
    return userDoc.exists && userData?.role === 'dealer';
  } catch (error) {
    console.error('Error checking dealer role:', error);
    return false;
  }
}

/**
 * Uploads an image file to Firebase Storage using admin SDK
 */
export async function uploadDealerImageAdmin(
  file: Buffer,
  filename: string,
  uid: string,
  type: 'logo' | 'banner'
): Promise<string> {
  // Check dealer role first
  const isDealer = await checkDealerRoleAdmin(uid);
  if (!isDealer) {
    throw new Error('User does not have dealer permissions');
  }

  const bucket = adminStorage.bucket();
  const path = `dealer-assets/${uid}/${type}`;
  const fileUpload = bucket.file(path);

  try {
    await fileUpload.save(file, {
      metadata: {
        contentType: `image/${filename.split('.').pop()?.toLowerCase()}`,
      },
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Fetches existing dealer profile if it exists using admin SDK
 */
export async function getDealerProfileAdmin(uid: string): Promise<DealerProfile | null> {
  try {
    const docRef = adminDb.collection('dealers').doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as DealerProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching dealer profile:', error);
    throw new Error('Failed to fetch dealer profile');
  }
}

/**
 * Submits or updates a dealer's profile using admin SDK
 */
export async function submitDealerProfileAdmin(
  uid: string,
  profile: Omit<DealerProfile, 'updatedAt'>,
  logoFile?: { buffer: Buffer; filename: string } | null,
  bannerFile?: { buffer: Buffer; filename: string } | null
): Promise<void> {
  try {
    // Check if user is a dealer
    const isDealer = await checkDealerRoleAdmin(uid);
    if (!isDealer) {
      throw new Error('User does not have dealer permissions');
    }

    // Upload images if provided
    let updatedProfile = { ...profile };

    if (logoFile) {
      const logoUrl = await uploadDealerImageAdmin(
        logoFile.buffer,
        logoFile.filename,
        uid,
        'logo'
      );
      updatedProfile.dealerLogoUrl = logoUrl;
    }

    if (bannerFile) {
      const bannerUrl = await uploadDealerImageAdmin(
        bannerFile.buffer,
        bannerFile.filename,
        uid,
        'banner'
      );
      updatedProfile.dealerBannerUrl = bannerUrl;
    }

    // Validate description length (100 words)
    const wordCount = profile.description.trim().split(/\s+/).length;
    if (wordCount > 100) {
      throw new Error('Description must not exceed 100 words');
    }

    // Add timestamp
    const finalProfile: DealerProfile = {
      ...updatedProfile,
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore using admin SDK
    const dealerRef = adminDb.collection('dealers').doc(uid);
    await dealerRef.set(finalProfile, { merge: true });
  } catch (error) {
    console.error('Error submitting dealer profile:', error);
    throw error;
  }
} 