"use client"

import { useState } from "react"

const tabs = [
  { id: "all", label: "All article" },
  { id: "reviews", label: "Car reviews" },
  { id: "advice", label: "Advice" },
  { id: "news", label: "News" },
  { id: "features", label: "Features" },
  { id: "bestofs", label: "Best ofs" },
  { id: "longterm", label: "Long-term car review" },
  { id: "guides", label: "Guides" },
]

export function NewsTabs() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="border-b border-border mb-8">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

