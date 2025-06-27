import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

// Define allowed methods
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  try {
    const { uid, type } = await request.json();

    if (!uid || !type) {
      return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 });
    }

    // Delete files based on type
    if (type === 'dealer') {
      // Delete dealer profile files (logo, banner)
      const dealerPath = `dealers/${uid}`;
      try {
        const [files] = await adminStorage.bucket().getFiles({ prefix: dealerPath });
        await Promise.all(files.map(file => file.delete()));
      } catch (error) {
        console.error('Error deleting dealer files:', error);
      }
    }

    if (type === 'vehicles') {
      // Delete all vehicle images for the dealer
      const vehiclesPath = `vehicles/${uid}`;
      try {
        const [files] = await adminStorage.bucket().getFiles({ prefix: vehiclesPath });
        await Promise.all(files.map(file => file.delete()));
      } catch (error) {
        console.error('Error deleting vehicle files:', error);
      }
    }

    return NextResponse.json({ message: 'Storage files deleted successfully' });
  } catch (error) {
    console.error('Error deleting storage files:', error);
    return NextResponse.json(
      { error: 'Failed to delete storage files' },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 