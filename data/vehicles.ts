export interface Vehicle {
  id: number
  image: string
  title: string
  price: number
  monthlyPrice: number
  year: string
  mileage: string
  distance: string
  location: string
  fuel: string
  transmission: string
  isHighlighted: boolean
}

export const vehicles: Vehicle[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=640&q=80",
    title: "2023 Audi Q5 S Line 40 TDI Quattro",
    price: 42999,
    monthlyPrice: 599,
    year: "2023",
    mileage: "5,420",
    distance: "3.2 miles away",
    location: "London Dealership",
    fuel: "Diesel",
    transmission: "Automatic",
    isHighlighted: true,
  },
  {
    id: 2,
    image: "https://www.topgear.com/sites/default/files/images/cars-road-test/carousel/2017/11/387275614baf16e63e8520f1172cd1c8/_smc4908.jpg?w=1952&h=1098",
    title: "2024 BMW X3 xDrive20d M Sport",
    price: 48795,
    monthlyPrice: 699,
    year: "2024",
    mileage: "1,250",
    distance: "5.7 miles away",
    location: "Premier BMW",
    fuel: "Diesel",
    transmission: "Automatic",
    isHighlighted: false,
  },
  {
    id: 3,
    image: "https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/QZAAAOSwb0xiefG8/$_86.JPG",
    title: "2022 Mercedes-Benz E300 AMG Line Premium Plus",
    price: 39995,
    monthlyPrice: 525,
    year: "2022",
    mileage: "12,850",
    distance: "8.1 miles away",
    location: "Auto Excellence",
    fuel: "Petrol Hybrid",
    transmission: "Automatic",
    isHighlighted: false,
  },
  {
    id: 4,
    image: "https://s.yimg.com/zb/imgv1/2ecef3ba-6227-3f32-b844-02e2bf46a057/t_500x300",
    title: "2025 Tesla Model Y Long Range",
    price: 51990,
    monthlyPrice: 649,
    year: "2025",
    mileage: "320",
    distance: "12.4 miles away",
    location: "EV Direct",
    fuel: "Electric",
    transmission: "Automatic",
    isHighlighted: true,
  },
  {
    id: 5,
    image: "https://i.ytimg.com/vi/YacZjYdoa4M/maxresdefault.jpg",
    title: "2023 Range Rover Sport HSE Dynamic",
    price: 76500,
    monthlyPrice: 899,
    year: "2023",
    mileage: "9,620",
    distance: "6.8 miles away",
    location: "Prestige Motors",
    fuel: "Petrol",
    transmission: "Automatic",
    isHighlighted: false,
  },
  {
    id: 6,
    image: "https://vehicle-images.dealerinspire.com/7dfb-110006168/WP0AB2Y16RSA35024/a9bc7955c8aec37f44d34ad8bc066017.jpg",
    title: "2024 Porsche Taycan 4S",
    price: 89995,
    monthlyPrice: 1250,
    year: "2024",
    mileage: "2,480",
    distance: "15.2 miles away",
    location: "Luxury Auto Center",
    fuel: "Electric",
    transmission: "Automatic",
    isHighlighted: true,
  },
  {
    id: 7,
    image: "https://media.autoexpress.co.uk/image/private/s--X-WVjvBW--/f_auto,t_content-image-full-desktop@1/v1633016243/autoexpress/2021/09/Volvo-XC60-2021-facelift-front-tracking.jpg",
    title: "2021 Volvo XC60 R-Design Pro",
    price: 37950,
    monthlyPrice: 499,
    year: "2021",
    mileage: "15,800",
    distance: "9.5 miles away",
    location: "Volvo City",
    fuel: "Diesel",
    transmission: "Automatic",
    isHighlighted: false,
  },
  {
    id: 8,
    image: "https://tse2.mm.bing.net/th?id=OIP.DQxvZwWTRupvN0Vu0S4eXgHaEK&pid=Api&P=0&h=180",
    title: "2020 Honda Civic Sport Line",
    price: 21495,
    monthlyPrice: 299,
    year: "2020",
    mileage: "9,800",
    distance: "2.3 miles away",
    location: "Honda Direct",
    fuel: "Petrol",
    transmission: "Manual",
    isHighlighted: false,
  },
  {
    id: 9,
    image: "https://tse4.mm.bing.net/th?id=OIP.qEtjTfasc6kUkTemPYOJ2wAAAA&pid=Api&P=0&h=180",
    title: "2022 Kia Sportage GT-Line",
    price: 28995,
    monthlyPrice: 399,
    year: "2022",
    mileage: "6,700",
    distance: "7.8 miles away",
    location: "Kia Motors",
    fuel: "Hybrid",
    transmission: "Automatic",
    isHighlighted: false,
  },
]; 