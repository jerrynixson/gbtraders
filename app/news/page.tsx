import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsSearch } from "@/components/news/news-search"
import { NewsTabs } from "@/components/news/news-tabs"
import { TopicTags } from "@/components/news/topic-tags"
import { NewsArticleCard } from "@/components/news/news-article-card"

// Sample news articles data
const newsArticles = [
  {
    title: "New Mercedes-Benz CLA is the longest-range electric car EVER!",
    excerpt:
      "Mercedes-Benz releases an all-new CLA, boasting a record-breaking electric range of almost 500 miles and a stunning interior",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-19%20133258-G5DHIHk3HCJlowZbzbsYOwyU6b2z4k.png#mercedes",
    date: "1 day ago",
    slug: "mercedes-benz-cla-electric",
  },
  {
    title: "BMW Z4 (2023) - 1 review",
    excerpt:
      "The BMW Z4 is cruising on a and nearing retirement so BMW has given it the parting gift of a clutch pedal - nice!",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-19%20133258-G5DHIHk3HCJlowZbzbsYOwyU6b2z4k.png#bmw",
    date: "1 day ago",
    rating: 4.5,
    slug: "bmw-z4-2023-review",
  },
  {
    title: "Land Rover Defender OCTA (2023) - 1 review",
    excerpt:
      "More powerful, unashamedly excessive, the Defender OCTA is Land Rover unleashed and a properly guilty pleasure",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-19%20133258-G5DHIHk3HCJlowZbzbsYOwyU6b2z4k.png#landrover",
    date: "2 days ago",
    rating: 4,
    slug: "land-rover-defender-octa-2023-review",
  },
  {
    title: "Audi Q8 e-tron (2023) - Expert Review",
    excerpt:
      "The Audi Q8 e-tron is a large, luxurious electric SUV that offers impressive range and a high-quality interior",
    image: "/placeholder.svg?height=400&width=600",
    date: "3 days ago",
    rating: 4.2,
    slug: "audi-q8-etron-2023-review",
  },
  {
    title: "Toyota Prius (2023) - First Drive",
    excerpt: "The new Toyota Prius is a striking hybrid that's more efficient and better to drive than ever before",
    image: "/placeholder.svg?height=400&width=600",
    date: "4 days ago",
    rating: 4.7,
    slug: "toyota-prius-2023-first-drive",
  },
  {
    title: "Electric car charging explained: how it works and how much it costs",
    excerpt: "Everything you need to know about charging an electric car at home, at work or on a public charger",
    image: "/placeholder.svg?height=400&width=600",
    date: "5 days ago",
    slug: "electric-car-charging-explained",
  },
]

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">CAR REVIEWS AND NEWS</h2>
          <h1 className="text-3xl font-bold mb-6">The latest car reviews, news and advice from our team</h1>
        </div>

        <NewsTabs />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <NewsSearch />
            <TopicTags />
          </div>

          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article, index) => (
                <NewsArticleCard key={index} {...article} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

