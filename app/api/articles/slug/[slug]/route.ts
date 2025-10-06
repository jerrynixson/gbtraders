import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Fetch an article by slug from either news or blog collections
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') !== 'false'; // Default to published only

    // Search in both news and blogs collections
    const collections = ['news', 'blogs'];
    let foundArticle = null;
    let articleType = null;

    for (const collectionName of collections) {
      let articlesQuery = query(
        collection(db, collectionName),
        where('slug', '==', params.slug)
      );

      // Add published filter if requested
      if (publishedOnly) {
        articlesQuery = query(articlesQuery, where('published', '==', true));
      }

      const snapshot = await getDocs(articlesQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        foundArticle = {
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        };
        articleType = collectionName === 'blogs' ? 'blog' : 'news';
        break;
      }
    }

    if (!foundArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      article: foundArticle,
      type: articleType 
    });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}