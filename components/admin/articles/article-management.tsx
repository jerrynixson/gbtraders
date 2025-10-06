"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye,
  Star,
  FileText,
  Newspaper
} from "lucide-react";
import { NewsArticle, BlogPost, ArticleType, ArticleFormData } from "@/lib/types/articles";
import { ArticleForm } from "./article-form";

interface ArticleManagementProps {
  className?: string;
}

export function ArticleManagement({ className }: ArticleManagementProps) {
  const { toast } = useToast();
  const [newsArticles, setNewsArticles] = useState<(NewsArticle & { type: 'news' })[]>([]);
  const [blogPosts, setBlogPosts] = useState<(BlogPost & { type: 'blog' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<(NewsArticle | BlogPost) & { type: ArticleType } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentType, setCurrentType] = useState<ArticleType>('news');
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; type: ArticleType; title: string } | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch news articles
      const newsResponse = await fetch('/api/articles?type=news');
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        setNewsArticles(newsData.articles.map((article: NewsArticle) => ({ ...article, type: 'news' as const })));
      }

      // Fetch blog posts
      const blogResponse = await fetch('/api/articles?type=blog');
      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        setBlogPosts(blogData.articles.map((post: BlogPost) => ({ ...post, type: 'blog' as const })));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = (type: ArticleType) => {
    setCurrentType(type);
    setSelectedArticle(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditArticle = (article: (NewsArticle | BlogPost) & { type: ArticleType }) => {
    setCurrentType(article.type);
    setSelectedArticle(article);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteArticle = (id: string, type: ArticleType, title: string) => {
    setArticleToDelete({ id, type, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      const response = await fetch(`/api/articles/${articleToDelete.id}?type=${articleToDelete.type}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (articleToDelete.type === 'news') {
          setNewsArticles(prev => prev.filter(article => article.id !== articleToDelete.id));
        } else {
          setBlogPosts(prev => prev.filter(post => post.id !== articleToDelete.id));
        }
        toast({
          title: "Success",
          description: "Article deleted successfully",
        });
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleFormSubmit = async (data: ArticleFormData & { type: ArticleType }) => {
    try {
      const url = isEditing && selectedArticle 
        ? `/api/articles/${selectedArticle.id}` 
        : '/api/articles';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchArticles(); // Refresh the list
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} article`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const filterArticles = (articles: any[]) => {
    if (!searchTerm) return articles;
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const ArticleTable = ({ articles, type }: { articles: any[], type: ArticleType }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filterArticles(articles).map((article) => (
          <TableRow key={article.id}>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{article.title}</div>
                <div className="text-sm text-muted-foreground">
                  {article.excerpt.substring(0, 100)}...
                </div>
                <div className="flex gap-1">
                  {article.featured && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {article.rating && (
                    <Badge variant="outline" className="text-xs">
                      ⭐ {article.rating}
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {article.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={article.published ? "default" : "secondary"}>
                {article.published ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(article.date)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteArticle(article.id, type, article.title)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="news" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News ({newsArticles.length})
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog ({blogPosts.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <TabsContent value="news">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>News Articles</CardTitle>
                <Button onClick={() => handleCreateArticle('news')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create News Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {newsArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No news articles found. Create your first one!
                </div>
              ) : (
                <ArticleTable articles={newsArticles} type="news" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Blog Posts</CardTitle>
                <Button onClick={() => handleCreateArticle('blog')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {blogPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No blog posts found. Create your first one!
                </div>
              ) : (
                <ArticleTable articles={blogPosts} type="blog" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article Form Modal */}
      <ArticleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        articleType={currentType}
        initialData={selectedArticle || undefined}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}