import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HowItWorks } from "@/components/dealer/how-it-works"
import { WhyAutoTrader } from "@/components/dealer/why-auto-trader"
import { GetDealerOffers } from "@/components/dealer/get-dealer-offers"
import { FaqSection } from "@/components/faq-section"

export default function DealerPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="bg-secondary py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white text-center">For Dealers</h1>
            <p className="text-xl text-white/80 text-center mt-4">
              Join our network of trusted dealers and grow your business
            </p>
          </div>
        </div>

        <HowItWorks />
        <WhyAutoTrader />
        <GetDealerOffers />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}

