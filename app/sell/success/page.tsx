import Link from "next/link"
import { Header } from "@/components/sell/header"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function Success() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-2xl font-semibold mb-4">Your ad has been created!</h1>

          <p className="text-gray-600 mb-8">
            Your vehicle listing has been successfully created and is now live on GB Traders. Potential buyers will be
            able to see your listing and contact you.
          </p>

          <div className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full bg-primary hover:bg-primary/90">Go to my dashboard</Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

