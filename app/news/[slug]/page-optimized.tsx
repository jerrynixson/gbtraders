"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewsArticle, BlogPost } from "@/lib/types/articles";

type Article = (NewsArticle | BlogPost) & { type: 'news' | 'blog' };

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [params.slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/slug/${params.slug}?published=true`);
      
      if (response.status === 404) {
        setNotFoundError(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setArticle({ ...data.article, type: data.type });
      } else {
        throw new Error('Failed to fetch article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Recently';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return d.toLocaleDateString();
  };

  const formatContent = (content: string) => {
    // Simple content formatting - convert line breaks to paragraphs
    // In production, you might want to use a proper markdown renderer
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFoundError || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>

          <article className="bg-card rounded-xl shadow-sm p-8">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span>{formatDate(article.date)}</span>
                {'rating' in article && article.rating && (
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    {article.rating}
                  </span>
                )}
                {article.featured && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                  {article.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
              <p className="text-xl text-muted-foreground">{article.excerpt}</p>
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Read time for blogs */}
              {'readTime' in article && article.readTime && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Estimated read time: {article.readTime} minutes
                </div>
              )}
            </div>

            {/* Featured Image */}
            {article.image && (
              <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg prose-img:shadow-sm">
              {/* If content contains HTML, render it directly, otherwise format plain text */}
              {article.content.includes('<') ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />
              )}
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {article.author ? article.author.charAt(0).toUpperCase() : 'GB'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{article.author || 'GB Traders'}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.type === 'news' ? 'News Team' : 'Blog Team'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Share on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Share on Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Share on LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Article metadata */}
              <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    Article type: {article.type === 'news' ? 'News Article' : 'Blog Post'}
                  </div>
                  {article.updatedAt && (
                    <div>
                      Last updated: {formatDate(article.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}