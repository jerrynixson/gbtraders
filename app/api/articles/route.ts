import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsArticle, BlogPost, ArticleFilters } from '@/lib/types/articles';

// GET - Fetch all articles with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'news' | 'blog' | null;
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const limitParam = searchParams.get('limit');
    const featured = searchParams.get('featured');

    const collectionName = type === 'blog' ? 'blogs' : 'news';
    let articlesQuery = query(collection(db, collectionName));

    // Apply filters
    if (category) {
      articlesQuery = query(articlesQuery, where('category', '==', category));
    }
    
    if (published !== null) {
      articlesQuery = query(articlesQuery, where('published', '==', published === 'true'));
    }

    if (featured !== null) {
      articlesQuery = query(articlesQuery, where('featured', '==', featured === 'true'));
    }

    // Order by date (newest first)
    articlesQuery = query(articlesQuery, orderBy('date', 'desc'));

    // Apply limit if specified
    if (limitParam) {
      articlesQuery = query(articlesQuery, limit(parseInt(limitParam)));
    }

    const snapshot = await getDocs(articlesQuery);
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...articleData } = body;

    if (!type || (type !== 'news' && type !== 'blog')) {
      return NextResponse.json(
        { error: 'Invalid article type. Must be "news" or "blog"' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    if (!articleData.slug) {
      articleData.slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Add timestamps
    const now = new Date();
    articleData.createdAt = now;
    articleData.date = now;

    const collectionName = type === 'blog' ? 'blogs' : 'news';
    const docRef = await addDoc(collection(db, collectionName), articleData);

    return NextResponse.json({ 
      id: docRef.id,
      message: `${type} article created successfully` 
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}