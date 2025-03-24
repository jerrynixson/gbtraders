import { Camera } from "lucide-react"

export function CarImageSection() { 
  return (
    <div className="relative">
      <div 
        className="h-64 md:h-80 rounded-md bg-[url('/cars/car1.jpg')] bg-cover bg-center mb-4"
      />
      
      <button className="flex items-center gap-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transform transition-all duration-300 hover:scale-105 absolute bottom-6 right-4 shadow-lg">
        <Camera className="h-4 w-4" />
        <span className="font-medium">View Gallery</span>
      </button>
    </div>
  )
}