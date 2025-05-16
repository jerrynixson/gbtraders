"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

// Define a type for blog post data
interface BlogPost {
  id: number;
  slug: string;
  category: string;
  author: string;
  date: string;
  title: string;
  imageUrl: string;
  altText: string;
  content: string;
  excerpt: string;
}

// Default blog posts data
const defaultBlogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "2024-bmw-alpina-xb7-exclusive-details",
    category: "Sound",
    author: "admin",
    date: "November 22, 2023",
    title: "2024 BMW ALPINA XB7 with exclusive details, extraordinary",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/635a87784fd587049e71890566306c75ce1aa55a",
    altText: "BMW car",
    content: "The 2024 BMW ALPINA XB7 represents the pinnacle of luxury and performance in the SUV segment. This extraordinary vehicle combines the spaciousness and versatility of an SUV with the performance and refinement of a luxury sedan. The ALPINA XB7 features exclusive details that set it apart from standard BMW models, including unique exterior styling elements, premium interior materials, and enhanced performance capabilities. With its powerful engine and sophisticated suspension system, the XB7 delivers an exceptional driving experience while maintaining the comfort and luxury expected from a high-end SUV.",
    excerpt: "Discover the extraordinary details and exclusive features of the 2024 BMW ALPINA XB7, a perfect blend of luxury and performance."
  },
  {
    id: 2,
    slug: "bmw-x6-m50i-sportiest-design",
    category: "Accessories",
    author: "admin",
    date: "November 22, 2023",
    title: "BMW X6 M50i is designed to exceed your sportiest.",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/dabf46859b0bf3e3446a96ca0e6b76be15cbaf13",
    altText: "BMW car",
    content: "The BMW X6 M50i represents the perfect fusion of coupe-like styling and SUV practicality. This high-performance variant is designed to exceed expectations with its sporty character and dynamic capabilities. The M50i features a powerful twin-turbocharged V8 engine that delivers impressive acceleration and power, while the sophisticated all-wheel-drive system ensures optimal traction in all conditions. The interior combines luxury with sport-focused elements, creating an engaging driving environment that complements the vehicle's dynamic capabilities.",
    excerpt: "Experience the perfect blend of coupe styling and SUV practicality with the sporty and dynamic BMW X6 M50i."
  },
  {
    id: 3,
    slug: "bmw-x5-gold-2024-sport-review",
    category: "Exterior",
    author: "admin",
    date: "November 22, 2023",
    title: "BMW X5 Gold 2024 Sport Review: Light on Sport",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/d1f1553227122c29b75fab5996c179fa59ab3cd2",
    altText: "BMW car",
    content: "The 2024 BMW X5 Gold Sport edition offers a unique take on the popular luxury SUV. While maintaining the X5's renowned comfort and versatility, this special edition adds distinctive gold accents and sport-inspired elements. The review explores how the Gold Sport edition balances luxury with performance, offering insights into its driving dynamics, interior features, and overall value proposition. Despite its sport-oriented name, the focus remains on providing a premium driving experience with enhanced visual appeal.",
    excerpt: "A detailed review of the 2024 BMW X5 Gold Sport edition, exploring its unique features and driving experience."
  }
];

// Props interface
interface BlogPostsSectionProps {
  posts?: BlogPost[];
}

const BlogPostsSection: React.FC<BlogPostsSectionProps> = ({ 
  posts = defaultBlogPosts 
}) => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              News & Blogs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Stay updated with the latest news, reviews, and stories from the automotive world
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Articles
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.id}
              href={`/news/${post.slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.altText}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-900 backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{post.author}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <time dateTime={post.date.replace(/\s/g, '-').toLowerCase()}>
                    {post.date}
                  </time>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>

                <div className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-2 transition-transform">
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPostsSection;