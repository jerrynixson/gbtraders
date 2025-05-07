import React from "react"

export function GBTraderFeatures() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-2 text-blue-900">GB Trader Features</h2>
        <p className="text-center text-lg text-blue-900 mb-12">Just a few reasons to buy and sell your car with us.</p>
        <div className="w-full flex flex-col md:flex-row md:divide-x md:divide-gray-300 gap-10 md:gap-0 justify-center items-center">
          {/* Left Side */}
          <div className="flex-1 flex flex-col gap-8 max-w-md w-full">
            <div className="flex items-start gap-4">
              {/* Smart Search Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* Globe + Magnifier SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth="2"/><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">Smart Search:</h3>
                <p className="text-blue-900">Easily find cars with advanced filters.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {/* User Profile Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* User SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" strokeWidth="2"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">User Profiles:</h3>
                <p className="text-blue-900">Manage listings and preferences.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {/* Secure Website Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* Shield SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 3l7 4v5c0 5.25-3.5 9.75-7 11-3.5-1.25-7-5.75-7-11V7l7-4z" strokeWidth="2"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">Secure Website:</h3>
                <p className="text-blue-900">SSL Encryption keeps you safe at all times.</p>
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div className="flex-1 flex flex-col gap-8 md:pl-12 max-w-md w-full">
            <div className="flex items-start gap-4">
              {/* Seller Contact Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* Paper Plane SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12l18-7-7 18-2.5-7.5L3 12z" strokeWidth="2"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">Seller Contact:</h3>
                <p className="text-blue-900">Communicate for details and negotiation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {/* Favorites Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* Heart SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 21s-6-4.35-9-8.5C-1.5 7.5 4.5 3 12 10.5 19.5 3 25.5 7.5 21 12.5c-3 4.15-9 8.5-9 8.5z" strokeWidth="2"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">Favorites:</h3>
                <p className="text-blue-900">Save and track preferred listings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {/* Location Icon */}
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-lg">
                {/* Map Pin SVG */}
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 21c-4.418 0-8-5.373-8-12A8 8 0 1 1 20 9c0 6.627-3.582 12-8 12z" strokeWidth="2"/><circle cx="12" cy="9" r="3" strokeWidth="2"/></svg>
              </span>
              <div>
                <h3 className="font-bold text-xl text-blue-900">Location-Based</h3>
                <p className="text-blue-900">Find cars nearby for inspection</p>
              </div>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 max-w-md w-full mx-auto">
          <a href="/sell" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-md text-lg text-center transition shadow-md">SELL YOUR CAR</a>
          <a href="/search" className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-bold py-4 rounded-md text-lg text-center transition shadow-md">SEARCH VEHICLES</a>
        </div>
      </div>
    </section>
  )
} 