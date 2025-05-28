interface ReviewsProps {
  carName: string
  rating: number
  reviewText: string
}

export function Reviews({ carName, rating, reviewText }: ReviewsProps) {
  // Generate stars based on rating
  const fullStars = Math.floor(rating)
  const emptyStars = 5 - fullStars

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4">Our review of the {carName}</h2>
      <div className="flex items-center mb-4">
        <div className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 mr-2">
          {rating.toFixed(1)}
        </div>
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-[#ff9a00]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          {[...Array(emptyStars)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{reviewText}</p>
      <button className="w-full text-sm text-primary border border-border rounded-full py-2 px-6 mb-8">
        Read the full review
      </button>
    </div>
  )
}

