"use client"

import { ChevronUp } from "lucide-react"

export function BackToTop() {
  return (
    <div className="mt-12 text-center">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="inline-flex flex-col items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronUp className="h-4 w-4" />
        <span>Back to top</span>
      </button>
    </div>
  )
}

