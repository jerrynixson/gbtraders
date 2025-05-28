import { MapPin, MessageCircle, Phone } from "lucide-react"
import { GoogleMapComponent } from "@/components/ui/google-map"

interface DealerInformationProps {
  name: string
  location: string
  rating: number
  phoneNumber: string
  description: string
}

export function DealerInformation({ 
  name, 
  location, 
  rating, 
  phoneNumber, 
  description 
}: DealerInformationProps) {
  return (
    <div className="border border-border rounded-md p-4 mb-8">
      <div className="flex items-center mb-4">
        <div className="w-[160px] h-[80px] rounded-md overflow-hidden">
          <GoogleMapComponent 
            center={{ lat: 51.4543, lng: -2.5879 }} // Bristol coordinates
            zoom={12}
            height="80px"
            width="160px"
          />
        </div>
      </div>
      <h3 className="font-semibold mb-2">
        {name} {location}
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        {description}
      </p>
      <div className="flex items-center mb-2">
        <div className="flex mr-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-[#ff9a00]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{rating} out of 5</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button className="flex items-center justify-center text-sm text-primary border border-border rounded-md py-2">
          <Phone className="w-4 h-4 mr-2" />
          {phoneNumber}
        </button>
        <button className="flex items-center justify-center text-sm text-primary border border-border rounded-md py-2">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center text-sm text-primary border border-border rounded-md py-2">
          <MapPin className="w-4 h-4 mr-2" />
          Get Directions
        </button>
        <button className="flex items-center justify-center text-sm text-primary border border-border rounded-md py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Visit website
        </button>
      </div>
    </div>
  )
}