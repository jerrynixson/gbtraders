import Image from "next/image"

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-lg overflow-hidden">
            <Image
              src="/how-does-it-work.png?height=500&width=600"
              alt="Dealer and customer discussing"
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">How does it work?</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">1. Value your car</h3>
                <p className="text-gray-600">
                  Get a valuation from the nation's used car experts. If you're happy, fill in some details and send us
                  pictures to build your auction listing.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">2. Get your offer</h3>
                <p className="text-gray-600">
                  Dealer Auction's network of trusted car dealers place bids to compete for your car. We'll share the
                  best offer for you to approve.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">3. Sell your car</h3>
                <p className="text-gray-600">
                  Arrange a collection time with the buyer. It couldn't be easier, with free collection from your home
                  and fast secure payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

