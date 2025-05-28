const topics = [
  "Electric Car",
  "SUVs",
  "Coming soon",
  "Family cars",
  "Good value",
  "Hatchback",
  "Estates",
  "Convertible",
  "Big boot",
  "Hybrid",
]

export function TopicTags() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">Explore topics</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button key={topic} className="px-3 py-1 bg-accent text-secondary rounded-full text-sm hover:bg-accent/80">
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}

