import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Extract the file path from the download URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)$/);
    
    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
    }
    
    // Decode the path (Firebase Storage encodes special characters)
    const encodedPath = pathMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);
    
    // Get the file reference and delete it
    const bucket = adminStorage.bucket();
    const file = bucket.file(decodedPath);
    
    // Check if file exists before trying to delete
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Delete the file
    await file.delete();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully',
      deletedPath: decodedPath 
    });
    
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
