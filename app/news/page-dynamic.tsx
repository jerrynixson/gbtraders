"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewsTabs } from "@/components/news/news-tabs";
import { TopicTags } from "@/components/news/topic-tags";
import { NewsArticleCard } from "@/components/news/news-article-card";
import { NewsArticle, BlogPost } from "@/lib/types/articles";

interface ExtendedArticle extends NewsArticle {
  type: 'news';
}

interface ExtendedBlog extends BlogPost {
  type: 'blog';
}

type Article = ExtendedArticle | ExtendedBlog;

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Fetch both news and blog articles
      const [newsResponse, blogResponse] = await Promise.all([
        fetch('/api/articles?type=news&published=true'),
        fetch('/api/articles?type=blog&published=true')
      ]);

      const newsData = newsResponse.ok ? await newsResponse.json() : { articles: [] };
      const blogData = blogResponse.ok ? await blogResponse.json() : { articles: [] };

      const allArticles: Article[] = [
        ...(newsData.articles || []).map((article: NewsArticle) => ({ ...article, type: 'news' as const })),
        ...(blogData.articles || []).map((post: BlogPost) => ({ ...post, type: 'blog' as const }))
      ];

      // Sort by date (newest first)
      allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setArticles(allArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">CAR REVIEWS AND NEWS</h2>
          <h1 className="text-3xl font-bold mb-6">The latest car reviews, news and advice from our team</h1>
        </div>

        <NewsTabs />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border border-border rounded-md bg-background"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <TopicTags />
          </div>

          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for new content'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <NewsArticleCard 
                    key={article.id} 
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.image}
                    date={formatDate(article.date)}
                    rating={'rating' in article ? article.rating : undefined}
                    slug={article.slug}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}