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
    // <section className="font-['DM_Sans']">
      <div className="px-0 py-16 mx-auto my-0 max-w-[1440px]">
        <header className="flex justify-between items-center px-4 py-0 mb-11 max-sm:flex-col max-sm:gap-4 max-sm:items-start">
          <h2 className="text-4xl font-bold text-slate-950 max-sm:text-3xl">
            Latest Blog Posts
          </h2>
          <Link 
            href="/blog" 
            className="flex gap-2.5 items-center text-base text-slate-950 hover:opacity-80 transition-opacity"
          >
            <span>View All</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
            >
              <path
                d="M13.8109 0.209961H5.25528C5.04032 0.209961 4.86638 0.383904 4.86638 0.598862C4.86638 0.81382 5.04032 0.987763 5.25528 0.987763H12.8721L0.313648 13.5462C0.161727 13.6981 0.161727 13.9442 0.313648 14.0961C0.389591 14.172 0.489122 14.21 0.588617 14.21C0.688112 14.21 0.787607 14.172 0.863586 14.0961L13.422 1.53766V9.15443C13.422 9.36939 13.5959 9.54333 13.8109 9.54333C14.0259 9.54333 14.1998 9.36939 14.1998 9.15443V0.598862C14.1998 0.383904 14.0258 0.209961 13.8109 0.209961Z"
                fill="#050B20"
              />
            </svg>
          </Link>
        </header>
        <div className="flex gap-5 px-4 py-0 max-md:flex-wrap max-md:justify-center max-sm:flex-col">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="w-[457px] max-md:w-[calc(50%_-_10px)] max-sm:w-full"
            >
              <div className="overflow-hidden relative mb-5 rounded-2xl">
                <Image
                  src={post.imageUrl}
                  alt={post.altText}
                  width={457}
                  height={298}
                  className="object-cover w-full h-[298px]"
                />
                <div className="absolute top-5 left-5 px-4 py-1 text-sm bg-white rounded-[30px] text-slate-950">
                  {post.category}
                </div>
              </div>
              <div className="flex gap-4 items-center mb-1.5 text-base text-slate-950">
                <span>{post.author}</span>
                <div
                  className="w-1 h-1 rounded-full bg-neutral-200"
                  aria-hidden="true"
                />
                <time dateTime={post.date.replace(/\s/g, '-').toLowerCase()}>
                  {post.date}
                </time>
              </div>
              <h3 className="text-xl leading-8 text-slate-950">
                {post.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    // </section>
  );
};

export default BlogPostsSection;