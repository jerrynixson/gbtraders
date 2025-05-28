import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Sample news articles data (this should be moved to a separate data file in production)
const newsArticles = [
  {
    title: "New Mercedes-Benz CLA is the longest-range electric car EVER!",
    excerpt:
      "Mercedes-Benz releases an all-new CLA, boasting a record-breaking electric range of almost 500 miles and a stunning interior",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-19%20133258-G5DHIHk3HCJlowZbzbsYOwyU6b2z4k.png#mercedes",
    date: "1 day ago",
    slug: "mercedes-benz-cla-electric",
    content: `
      <h2>Revolutionary Electric Range</h2>
      <p>The new Mercedes-Benz CLA has set a new benchmark in the electric vehicle market with its groundbreaking range of nearly 500 miles on a single charge. This achievement is made possible by Mercedes' latest battery technology and aerodynamic design.</p>
      
      <h2>Stunning Interior Design</h2>
      <p>The interior of the new CLA is a masterpiece of luxury and technology. Featuring the latest MBUX infotainment system with hyperscreen display, ambient lighting, and premium materials throughout, the cabin offers an unparalleled driving experience.</p>
      
      <h2>Performance and Efficiency</h2>
      <p>With a dual-motor setup producing 402 horsepower, the CLA Electric can accelerate from 0-60 mph in just 4.5 seconds. Despite this impressive performance, the car maintains exceptional efficiency thanks to its advanced regenerative braking system.</p>
      
      <h2>Advanced Safety Features</h2>
      <p>The new CLA comes equipped with Mercedes' latest driver assistance systems, including adaptive cruise control, lane-keeping assist, and automated emergency braking. The car also features a comprehensive airbag system and reinforced safety cell.</p>
      
      <h2>Pricing and Availability</h2>
      <p>The Mercedes-Benz CLA Electric will start at $55,000 and is expected to hit showrooms in Q3 2024. Pre-orders are now open through Mercedes-Benz dealerships worldwide.</p>
    `
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
    content: `
      <h2>Return of the Manual Transmission</h2>
      <p>In a surprising move, BMW has reintroduced the manual transmission to the Z4 lineup for its final model year. This six-speed manual gearbox is paired with the 3.0-liter turbocharged inline-six engine, offering enthusiasts one last chance to experience pure driving pleasure.</p>
      
      <h2>Performance Specifications</h2>
      <p>The 2023 BMW Z4 M40i produces 382 horsepower and 369 lb-ft of torque. With the manual transmission, it can accelerate from 0-60 mph in 4.2 seconds, while the automatic version shaves off 0.2 seconds from this time.</p>
      
      <h2>Driving Experience</h2>
      <p>The manual transmission adds a new dimension to the Z4's driving experience. The clutch pedal has been carefully tuned to provide perfect weight and feedback, while the gear lever offers precise, mechanical shifts that remind us of BMW's golden era.</p>
      
      <h2>Interior and Technology</h2>
      <p>The cabin features BMW's latest iDrive 8 system with a 12.3-inch digital instrument cluster and 14.9-inch central display. The sports seats are upholstered in premium Merino leather, and the M Sport steering wheel features shift paddles for automatic models.</p>
      
      <h2>Final Thoughts</h2>
      <p>While the Z4's production is coming to an end, BMW has given it a fitting send-off with the manual transmission option. This final edition will surely become a collector's item for BMW enthusiasts.</p>
    `
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
    content: `
      <h2>Unprecedented Power</h2>
      <p>The Defender OCTA represents the pinnacle of Land Rover's engineering prowess. Powered by a 4.4-liter twin-turbo V8 engine producing 635 horsepower and 590 lb-ft of torque, it's the most powerful Defender ever built.</p>
      
      <h2>Off-Road Capability</h2>
      <p>Despite its performance focus, the OCTA maintains the Defender's legendary off-road capabilities. The Terrain Response 2 system has been enhanced with a new OCTA mode, specifically tuned for high-speed off-road driving.</p>
      
      <h2>Luxury and Comfort</h2>
      <p>The interior is a perfect blend of rugged capability and luxury. Premium materials, including semi-aniline leather and sustainable wood trim, create an environment that's both sophisticated and durable.</p>
      
      <h2>Advanced Technology</h2>
      <p>The OCTA features Land Rover's latest Pivi Pro infotainment system with a 13.1-inch touchscreen, digital instrument cluster, and advanced driver assistance systems. The optional 3D surround camera system provides unparalleled visibility in challenging conditions.</p>
      
      <h2>Pricing and Availability</h2>
      <p>Starting at $150,000, the Defender OCTA is a limited-production model. Only 1,000 units will be built, making it one of the most exclusive Land Rovers ever produced.</p>
    `
  },
  {
    title: "Audi Q8 e-tron (2023) - Expert Review",
    excerpt:
      "The Audi Q8 e-tron is a large, luxurious electric SUV that offers impressive range and a high-quality interior",
    image: "/placeholder.svg?height=400&width=600",
    date: "3 days ago",
    rating: 4.2,
    slug: "audi-q8-etron-2023-review",
    content: `
      <h2>Electric Performance</h2>
      <p>The Q8 e-tron features a dual-motor setup producing 402 horsepower and 490 lb-ft of torque. With a 0-60 mph time of 5.6 seconds, it offers brisk acceleration while maintaining the comfort expected from a luxury SUV.</p>
      
      <h2>Range and Charging</h2>
      <p>The 114 kWh battery provides an impressive EPA-estimated range of 330 miles. The Q8 e-tron supports DC fast charging at up to 170 kW, allowing for a 10-80% charge in just 31 minutes.</p>
      
      <h2>Luxury Interior</h2>
      <p>The cabin features Audi's latest MMI touch response system with dual touchscreens, a 12.3-inch digital instrument cluster, and premium materials throughout. The optional Bang & Olufsen 3D sound system provides an exceptional audio experience.</p>
      
      <h2>Advanced Technology</h2>
      <p>Standard features include adaptive air suspension, quattro all-wheel drive, and a comprehensive suite of driver assistance systems. The optional augmented reality head-up display projects navigation instructions onto the windshield.</p>
      
      <h2>Pricing and Options</h2>
      <p>The Q8 e-tron starts at $74,400 and offers three trim levels: Premium, Premium Plus, and Prestige. Various option packages allow for extensive customization of the vehicle's features and appearance.</p>
    `
  },
  {
    title: "Toyota Prius (2023) - First Drive",
    excerpt: "The new Toyota Prius is a striking hybrid that's more efficient and better to drive than ever before",
    image: "/placeholder.svg?height=400&width=600",
    date: "4 days ago",
    rating: 4.7,
    slug: "toyota-prius-2023-first-drive",
    content: `
      <h2>Redesigned for the Future</h2>
      <p>The 2023 Prius represents a complete redesign of Toyota's iconic hybrid. With a sleek, aerodynamic profile and modern styling, it looks nothing like its predecessors while maintaining the efficiency that made it famous.</p>
      
      <h2>Hybrid Performance</h2>
      <p>The new Prius features a 2.0-liter four-cylinder engine paired with two electric motors, producing a combined 194 horsepower. This represents a significant increase in power while maintaining excellent fuel economy.</p>
      
      <h2>Efficiency and Range</h2>
      <p>EPA estimates show the Prius achieving up to 57 mpg in the city and 56 mpg on the highway. The plug-in hybrid version offers up to 39 miles of electric-only range, making it perfect for daily commutes.</p>
      
      <h2>Interior and Technology</h2>
      <p>The cabin features a modern design with a 12.3-inch touchscreen, digital instrument cluster, and Toyota's latest Safety Sense 3.0 system. The interior materials have been upgraded, offering a more premium feel.</p>
      
      <h2>Value Proposition</h2>
      <p>Starting at $27,450, the new Prius offers exceptional value. With its combination of style, efficiency, and technology, it's set to redefine the hybrid market once again.</p>
    `
  },
  {
    title: "Electric car charging explained: how it works and how much it costs",
    excerpt: "Everything you need to know about charging an electric car at home, at work or on a public charger",
    image: "/placeholder.svg?height=400&width=600",
    date: "5 days ago",
    slug: "electric-car-charging-explained",
    content: `
      <h2>Types of Charging</h2>
      <p>There are three main types of electric vehicle charging: Level 1 (120V), Level 2 (240V), and DC Fast Charging. Each offers different charging speeds and is suited for different situations.</p>
      
      <h2>Home Charging</h2>
      <p>Level 1 charging uses a standard household outlet and provides about 4-5 miles of range per hour. Level 2 charging requires a 240V outlet and can provide 25-30 miles of range per hour, making it ideal for overnight charging.</p>
      
      <h2>Public Charging</h2>
      <p>Public charging stations are becoming increasingly common. Level 2 public chargers are typically found at shopping centers and workplaces, while DC Fast Chargers are located along highways for quick top-ups during long trips.</p>
      
      <h2>Cost Considerations</h2>
      <p>The cost of charging varies by location and electricity rates. On average, charging at home costs about $0.15 per kWh, while public charging can range from $0.30 to $0.60 per kWh. DC Fast Charging is typically the most expensive option.</p>
      
      <h2>Charging Networks</h2>
      <p>Major charging networks include Tesla Supercharger, Electrify America, and ChargePoint. Many networks offer subscription plans that can reduce the cost of charging, while some automakers provide free charging for a limited time with new vehicle purchases.</p>
      
      <h2>Tips for Efficient Charging</h2>
      <p>To maximize charging efficiency, consider charging during off-peak hours when electricity rates are lower. Also, maintaining your battery between 20% and 80% charge can help prolong its lifespan.</p>
    `
  }
]

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = newsArticles.find((article) => article.slug === params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>

          <article className="bg-card rounded-xl shadow-sm p-8">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span>{article.date}</span>
                {article.rating && (
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    {article.rating}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
              <p className="text-xl text-muted-foreground">{article.excerpt}</p>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">GB</span>
                  </div>
                  <div>
                    <p className="font-medium">GB Traders</p>
                    <p className="text-sm text-muted-foreground">Automotive News Team</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-full hover:bg-muted transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-muted transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-muted transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
} 