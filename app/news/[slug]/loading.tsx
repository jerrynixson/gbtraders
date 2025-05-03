export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 bg-muted rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/4 mb-8 animate-pulse" />
          
          <div className="aspect-video bg-muted rounded-lg mb-8 animate-pulse" />
          
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
} 