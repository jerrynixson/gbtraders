export function CarImageSection() { 
  return (
    <div>
      <div 
        className="h-64 md:h-80 rounded-md bg-[url('/cars/car1.jpg')] bg-cover bg-center mb-4"
      />
      <button className="text-xs text-primary mb-6">View Gallery</button>
    </div>
  )
}
