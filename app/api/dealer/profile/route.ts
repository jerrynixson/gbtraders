import { NextRequest, NextResponse } from 'next/server';
import { submitDealerProfileAdmin, getDealerProfileAdmin } from '@/lib/dealer/admin-profile';
import { adminAuth } from '@/lib/firebase-admin';
import { DealerProfile } from '@/lib/dealer/profile';

export async function POST(request: NextRequest) {
  try {
    // Get the current user's ID token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the form data
    const formData = await request.formData();
    
    // Parse the profile data
    const profileData = JSON.parse(formData.get('profile') as string) as Omit<DealerProfile, 'updatedAt'>;
    
    // Get the files if they exist
    const logoFile = formData.get('logo') as File | null;
    const bannerFile = formData.get('banner') as File | null;

    // Convert files to buffers if they exist
    const logoBuffer = logoFile ? Buffer.from(await logoFile.arrayBuffer()) : null;
    const bannerBuffer = bannerFile ? Buffer.from(await bannerFile.arrayBuffer()) : null;

    // Submit the profile using admin SDK
    await submitDealerProfileAdmin(
      uid,
      profileData,
      logoBuffer && logoFile ? { buffer: logoBuffer, filename: logoFile.name } : null,
      bannerBuffer && bannerFile ? { buffer: bannerBuffer, filename: bannerFile.name } : null
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in dealer profile API:', error);
    return NextResponse.json(
      { error: 'Failed to update dealer profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user's ID token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the dealer profile using admin SDK
    const profile = await getDealerProfileAdmin(uid);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Dealer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in dealer profile API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dealer profile' },
      { status: 500 }
    );
  }
} 