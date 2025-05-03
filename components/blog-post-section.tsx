"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

// Define a type for blog post data
interface BlogPost {
  id: number;
  category: string;
  author: string;
  date: string;
  title: string;
  imageUrl: string;
  altText: string;
}

// Default blog posts data
const defaultBlogPosts: BlogPost[] = [
  {
    id: 1,
    category: "Sound",
    author: "admin",
    date: "November 22, 2023",
    title: "2024 BMW ALPINA XB7 with exclusive details, extraordinary",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/635a87784fd587049e71890566306c75ce1aa55a",
    altText: "BMW car"
  },
  {
    id: 2,
    category: "Accessories",
    author: "admin",
    date: "November 22, 2023",
    title: "BMW X6 M50i is designed to exceed your sportiest.",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/dabf46859b0bf3e3446a96ca0e6b76be15cbaf13",
    altText: "BMW car"
  },
  {
    id: 3,
    category: "Exterior",
    author: "admin",
    date: "November 22, 2023",
    title: "BMW X5 Gold 2024 Sport Review: Light on Sport",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/d1f1553227122c29b75fab5996c179fa59ab3cd2",
    altText: "BMW car"
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
    <div className="px-4 py-20 mx-auto my-0 max-w-[1440px] bg-gradient-to-b from-white to-gray-50">
      <header className="flex justify-between items-center px-4 py-0 mb-12 max-sm:flex-col max-sm:gap-4 max-sm:items-start">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground max-sm:text-xl tracking-tight">
          Latest Blog Posts
        </h2>
        <Link 
          href="/news" 
          className="flex gap-2 items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          <span>View All</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
          >
            <path
              d="M13.8109 0.209961H5.25528C5.04032 0.209961 4.86638 0.383904 4.86638 0.598862C4.86638 0.81382 5.04032 0.987763 5.25528 0.987763H12.8721L0.313648 13.5462C0.161727 13.6981 0.161727 13.9442 0.313648 14.0961C0.389591 14.172 0.489122 14.21 0.588617 14.21C0.688112 14.21 0.787607 14.172 0.863586 14.0961L13.422 1.53766V9.15443C13.422 9.36939 13.5959 9.54333 13.8109 9.54333C14.0259 9.54333 14.1998 9.36939 14.1998 9.15443V0.598862C14.1998 0.383904 14.0258 0.209961 13.8109 0.209961Z"
              fill="currentColor"
            />
          </svg>
        </Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-0">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="group relative overflow-hidden rounded-xl transition-all duration-300"
          >
            {/* Glassmorphism background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group-hover:border-primary/20 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300" />
            
            {/* Content */}
            <div className="relative">
              <div className="overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.altText}
                  width={457}
                  height={298}
                  className="object-cover w-full h-[298px] group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 text-xs font-medium bg-white/70 backdrop-blur-md rounded-full text-primary border border-white/30 shadow-[0_2px_8px_0_rgba(31,38,135,0.05)]">
                  {post.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-2 items-center mb-2 text-xs text-muted-foreground">
                  <span className="font-medium">{post.author}</span>
                  <div
                    className="w-1 h-1 rounded-full bg-muted"
                    aria-hidden="true"
                  />
                  <time dateTime={post.date.replace(/\s/g, '-').toLowerCase()}>
                    {post.date}
                  </time>
                </div>
                <h3 className="text-base font-medium leading-6 text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogPostsSection;