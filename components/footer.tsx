import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - About */}
          <div>
            <p className="mb-6 text-gray-300">
              GB Trader offers new and used cars right across the United Kingdom. Join our site and start buying and
              selling used cars like many other traders just like you have..
            </p>
            <Link href="/about" className="text-gray-300 hover:text-white">
              More about us
            </Link>
          </div>

          {/* Column 2 - Get in Touch */}
          <div>
            <h3 className="text-lg font-semibold mb-6 uppercase">Get in Touch</h3>
            <p className="mb-6 text-gray-300">
              If you with to contact us for any reason at all feel free to use the contact details below.
            </p>
            <address className="not-italic text-gray-300 space-y-2">
              <p>84 Bordelsey Street, UK</p>
              <p>+44 (0121) 456 78 90</p>
              <p>info@gbtrader.com</p>
            </address>
          </div>

          {/* Column 3 - Connect with Us */}
          <div>
            <h3 className="text-lg font-semibold mb-6 uppercase">Connect with Us</h3>
            <p className="mb-6 text-gray-300">
              Stay up-to-date on the latest news and events and get any offers available first by following us on our
              social media.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-[#0f1727] py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} GB Trader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

