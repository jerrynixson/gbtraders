import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search } from "lucide-react"

export function Hero() {
  return (
    <section className="bg-secondary">
      <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col justify-center mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            WELCOME
            <br />
            TO
            <br />
            <span className="text-5xl md:text-6xl">GB TRADERS</span>
          </h1>
          <p className="text-gray-300 italic">Drive off today</p>
        </div>
        <div className="w-full md:w-1/2 bg-white p-6 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Discover Your Perfect Drive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Postcode" />
            <Select>
              <option value="">Vehicle Type</option>
            </Select>
            <Select>
              <option value="">Brand</option>
            </Select>
            <Select>
              <option value="">Model</option>
            </Select>
            <Select>
              <option value="">Min Price</option>
            </Select>
            <Select>
              <option value="">Max price</option>
            </Select>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 mb-4">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <div className="flex justify-between text-sm">
            <Button variant="link" className="text-gray-500 p-0 h-auto">
              Reset filters
            </Button>
            <Button variant="link" className="text-primary p-0 h-auto">
              More options
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

