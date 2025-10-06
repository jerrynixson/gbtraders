export interface NewsArticle {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: Date;
  rating?: number;
  slug: string;
  category: 'news' | 'review' | 'guide' | 'blog';
  tags: string[];
  author: string;
  published: boolean;
  featured?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: Date;
  slug: string;
  category: 'tips' | 'maintenance' | 'buying-guide' | 'industry-news' | 'reviews';
  tags: string[];
  author: string;
  published: boolean;
  featured?: boolean;
  readTime?: number; // estimated read time in minutes
  createdAt: Date;
  updatedAt?: Date;
}

export type ArticleType = 'news' | 'blog';

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  published: boolean;
  featured?: boolean;
  rating?: number; // only for reviews
  readTime?: number; // only for blogs
}

export interface ArticleFilters {
  category?: string;
  published?: boolean;
  featured?: boolean;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ArticleSortOptions {
  field: 'title' | 'date' | 'createdAt' | 'category' | 'author';
  direction: 'asc' | 'desc';
}