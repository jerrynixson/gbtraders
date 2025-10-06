# News and Blog Management System

This document explains how to use the new news and blog management system in the admin panel.

## Overview

The admin panel now includes a comprehensive article management system that allows administrators to create, edit, and manage both news articles and blog posts through a user-friendly interface.

## Features

### 1. Article Types
- **News Articles**: For news, reviews, guides, and general blog content
- **Blog Posts**: For tips, maintenance guides, buying guides, industry news, and reviews

### 2. Article Fields
- **Title**: Article headline
- **Excerpt**: Short description/summary
- **Content**: Full article content
- **Image**: Featured image URL
- **Category**: Predefined categories based on article type
- **Tags**: Searchable keywords
- **Rating**: Star rating (for reviews only)
- **Read Time**: Estimated reading time (for blogs only)
- **Published**: Whether the article is live
- **Featured**: Whether to highlight the article

### 3. Admin Interface Features
- **Create Articles**: Add new news articles and blog posts
- **Edit Articles**: Modify existing content
- **Delete Articles**: Remove unwanted articles
- **Search**: Find articles by title, excerpt, or category
- **Filter**: View articles by publication status
- **Bulk Management**: Efficient content management

## How to Use

### Accessing the Article Management
1. Navigate to the admin panel (`/admin`)
2. Click on the "Articles" tab
3. Choose between "News" and "Blog" sub-tabs

### Creating a New Article
1. Click the "Create News Article" or "Create Blog Post" button
2. Fill in all required fields (marked with *)
3. Add tags by typing in the tag field and clicking the "+" button
4. Set publishing options (Published/Draft, Featured)
5. For reviews, add a rating (1-5 stars)
6. For blogs, optionally add estimated read time
7. Click "Create Article" to save

### Editing an Article
1. Find the article in the list
2. Click the three-dot menu (⋯) and select "Edit"
3. Modify the fields as needed
4. Click "Update Article" to save changes

### Deleting an Article
1. Find the article in the list
2. Click the three-dot menu (⋯) and select "Delete"
3. Confirm the deletion in the dialog

### Article Categories

#### News Article Categories:
- **News**: General automotive news
- **Review**: Car reviews with ratings
- **Guide**: How-to guides and tutorials
- **Blog**: General blog content

#### Blog Post Categories:
- **Tips**: Helpful tips and advice
- **Maintenance**: Car maintenance guides
- **Buying Guide**: Car buying advice
- **Industry News**: Industry-specific news
- **Reviews**: Product/service reviews

## API Endpoints

The system uses these API endpoints:

- `GET /api/articles?type={news|blog}` - Fetch articles
- `POST /api/articles` - Create new article
- `GET /api/articles/[id]?type={news|blog}` - Get specific article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]?type={news|blog}` - Delete article

## Firebase Collections

Articles are stored in two Firestore collections:
- `news` - For news articles
- `blogs` - For blog posts

## Displaying Articles

The news page (`/news`) now dynamically fetches and displays published articles from the database. The original hardcoded articles have been preserved in the original page file for reference.

## Technical Details

### Type Safety
- Full TypeScript support with proper interfaces
- Type-safe API responses
- Component prop validation

### Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages
- Loading states for better UX

### Performance
- Efficient data fetching
- Optimized re-renders
- Pagination ready (can be implemented if needed)

## Future Enhancements

Potential improvements that could be added:
1. Rich text editor for content formatting
2. Image upload functionality
3. Article scheduling/publishing dates
4. Author management
5. Comment system
6. Analytics integration
7. SEO optimization fields
8. Article templates
9. Bulk import/export
10. Version history/revisions

## Troubleshooting

### Common Issues:
1. **Articles not appearing**: Check if they're published
2. **Image not loading**: Verify the image URL is valid and accessible
3. **Cannot edit/delete**: Ensure admin permissions are correct
4. **Form not submitting**: Check all required fields are filled

### Error Messages:
- "Failed to fetch articles": Check network connection and API status
- "Article not found": The article may have been deleted
- "Invalid article type": Ensure type is either 'news' or 'blog'

## Support

If you encounter any issues with the article management system, check the browser console for error messages and ensure all required fields are properly filled when creating or editing articles.