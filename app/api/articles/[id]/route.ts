import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Fetch a specific article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'news' | 'blog';

    if (!type) {
      return NextResponse.json(
        { error: 'Article type is required' },
        { status: 400 }
      );
    }

    const collectionName = type === 'blog' ? 'blogs' : 'news';
    const docRef = doc(db, collectionName, params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data()?.date?.toDate(),
      createdAt: docSnap.data()?.createdAt?.toDate(),
      updatedAt: docSnap.data()?.updatedAt?.toDate(),
    };

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update an article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, ...updateData } = body;

    if (!type || (type !== 'news' && type !== 'blog')) {
      return NextResponse.json(
        { error: 'Invalid article type. Must be "news" or "blog"' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    const collectionName = type === 'blog' ? 'blogs' : 'news';
    const docRef = doc(db, collectionName, params.id);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    await updateDoc(docRef, updateData);

    return NextResponse.json({ 
      message: `${type} article updated successfully` 
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'news' | 'blog';

    if (!type) {
      return NextResponse.json(
        { error: 'Article type is required' },
        { status: 400 }
      );
    }

    const collectionName = type === 'blog' ? 'blogs' : 'news';
    const docRef = doc(db, collectionName, params.id);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ 
      message: `${type} article deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}