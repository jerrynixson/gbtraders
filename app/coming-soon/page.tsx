"use client";
import Link from 'next/link';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ComingSoon() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
        <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full">
          {/* Minimal Animated Hourglass Icon */}
          <div className="mb-8 animate-hourglass">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="14" y="6" width="28" height="6" rx="3" fill="#6366f1" />
              <rect x="14" y="44" width="28" height="6" rx="3" fill="#6366f1" />
              <path d="M18 12 Q28 28 38 12" stroke="#6366f1" strokeWidth="2.5" fill="none" />
              <path d="M18 44 Q28 28 38 44" stroke="#6366f1" strokeWidth="2.5" fill="none" />
              <ellipse cx="28" cy="28" rx="4" ry="2.5" fill="#6366f1" opacity="0.15" />
              <ellipse cx="28" cy="20" rx="2.5" ry="1.5" fill="#6366f1" opacity="0.3" />
              <ellipse cx="28" cy="36" rx="2.5" ry="1.5" fill="#6366f1" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight text-center">Coming Soon</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
            We’re putting the finishing touches on something special.<br />
            Please check back soon!
          </p>
          <Link href="/">
            <button className="px-7 py-2 rounded-full bg-indigo-600 text-white font-semibold text-base shadow-md hover:bg-indigo-700 transition">
              Go to Home
            </button>
          </Link>
        </div>
      </div>
      <Footer />
      <style jsx global>{`
        @keyframes hourglass {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-hourglass {
          animation: hourglass 2.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
} 