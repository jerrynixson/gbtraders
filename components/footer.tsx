import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold mb-4">GB Trader Group</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Security advice
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  About us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Investor information
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Privacy policies and terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  External wellbeing support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Manage cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold mb-4">Products & services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Buying
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Selling
                </Link>
              </li>
            </ul>

            <h3 className="font-semibold mt-8 mb-4">Quick search</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  GB Trader for dealers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold mb-4">Help us improve our website</h3>
            <Button variant="outline" size="sm" className="text-xs">
              Send feedback
            </Button>

            <div className="mt-8 text-xs text-gray-500">
              <p className="mb-2">
                GB Trader Limited is authorised and regulated by the Financial Conduct Authority (FCA) for insurance
                mediation activities.
              </p>
              <p className="mb-2">Registered office and headquarters:</p>
              <p>2 Floor</p>
              <p>5 Place</p>
              <p>Manchester</p>
              <p>UK 5JD</p>
              <p>United Kingdom</p>
              <p>Registered number: 4xxxxx</p>
            </div>
          </div>

          {/* Column 4 */}
          <div className="text-xs text-gray-500">
            <p className="mb-4">
              The services available on this page are designed to give an example of how a finance agreement could look
              for this vehicle. Finance is subject to status (for example, your income, employment and credit history).
              Terms and conditions apply. Available to UK residents only. All dealerships may not make a payment or give
              you a discount.
            </p>
            <p className="mb-4">
              GB Trader Limited receives a fee or commission for these services, however these arrangements are:
            </p>
            <p>If you need more information...</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Copyright © GB Trader Limited 2025</p>
        </div>
      </div>
    </footer>
  )
}

