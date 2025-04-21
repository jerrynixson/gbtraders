"use client";

import React, { useState } from 'react';
import { ChevronRight, Clock, Shield, Wrench, Truck, Star, Phone, MapPin } from 'lucide-react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type ServiceType = 'roadside' | 'recovery' | 'homestart' | 'onward';

interface Service {
  title: string;
  description: string;
  features: string[];
  price: string;
  period: string;
}

interface Services {
  [key: string]: Service;
}

export default function BreakdownServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceType>('roadside');

  const services: Services = {
    roadside: {
      title: "Roadside Assistance",
      description: "Immediate roadside help for breakdowns, flat tyres, battery issues and more.",
      features: [
        "24/7 emergency assistance",
        "Nationwide coverage",
        "30-minute average response time",
        "Qualified technicians"
      ],
      price: "£89.99",
      period: "per year"
    },
    recovery: {
      title: "Vehicle Recovery",
      description: "Full recovery service to take your vehicle to a garage of your choice or home.",
      features: [
        "UK-wide recovery",
        "Home or garage delivery",
        "Alternative transport options",
        "Storage facilities available"
      ],
      price: "£119.99",
      period: "per year"
    },
    homestart: {
      title: "Home Start",
      description: "If your car won't start at home, our technicians will come to your driveway.",
      features: [
        "Battery diagnostics",
        "Fuel system checks",
        "Electrical system testing",
        "Minor repairs on-site"
      ],
      price: "£69.99",
      period: "per year"
    },
    onward: {
      title: "Onward Travel",
      description: "Continue your journey with replacement vehicle or accommodation if needed.",
      features: [
        "Replacement vehicle for up to 3 days",
        "Hotel accommodation if required",
        "Alternative transport reimbursement",
        "Covers up to 4 passengers"
      ],
      price: "£149.99",
      period: "per year"
    }
  };
  
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">24/7 Roadside Assistance & Recovery</h2>
              <p className="text-xl mb-6">Fast, reliable breakdown coverage across the UK with GB Trader's trusted network of specialists.</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <span>24/7 Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-yellow-400" />
                  <span>UK-Wide Coverage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-yellow-400" />
                  <span>Qualified Technicians</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <span>Fully Insured</span>
                </div>
              </div>
              <button className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-md">Get Covered Now</button>
            </div>
            <div className="md:w-2/5">
              <div className="bg-white rounded-lg shadow-xl p-6 text-gray-800">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Emergency Breakdown?</h3>
                <p className="mb-4">Call our 24/7 emergency assistance line:</p>
                <div className="text-3xl font-bold text-blue-900 mb-6 flex items-center">
                  <Phone className="h-8 w-8 mr-2" />
                  0800 090 2333
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Already a member? Log in to manage your coverage</p>
                  <button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-md">Log In</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Options */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Our Breakdown Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(services).map(([key, service]) => (
              <div 
                key={key}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 ${selectedService === key ? 'ring-4 ring-blue-500 transform scale-105' : 'hover:shadow-lg'}`}
                onClick={() => setSelectedService(key as ServiceType)}
              >
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                  <div className="text-2xl font-bold text-blue-900 mb-1">{service.price}</div>
                  <div className="text-sm text-gray-500 mb-4">{service.period}</div>
                  <button className={`w-full py-2 px-4 rounded-md mt-auto ${selectedService === key ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                    {selectedService === key ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Selected Service Details */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-blue-900">{services[selectedService].title} Details</h3>
              <div className="bg-blue-100 text-blue-900 py-1 px-4 rounded-full font-bold">
                {services[selectedService].price} {services[selectedService].period}
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{services[selectedService].description}</p>
            
            <div className="mb-8">
              <h4 className="text-lg font-bold text-blue-900 mb-4">What's Included:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services[selectedService].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-md">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">How Our Breakdown Service Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">1. Call for Help</h3>
              <p className="text-gray-600">When you break down, call our 24/7 helpline and we'll locate you using GPS.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">2. Fast Response</h3>
              <p className="text-gray-600">Our closest breakdown specialist will be dispatched to your location.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">3. Fix or Recovery</h3>
              <p className="text-gray-600">We'll try to fix your vehicle on-site, or recover it to a garage if needed.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Manchester",
                rating: 5,
                text: "The response time was incredible! I broke down on the M6 and they were with me in less than 30 minutes. Highly recommend GB Trader's breakdown service."
              },
              {
                name: "James Wilson",
                location: "London",
                rating: 5,
                text: "I've used their service twice now and both times they've been professional, quick and very helpful. Worth every penny for the peace of mind."
              },
              {
                name: "Emma Thompson",
                location: "Edinburgh",
                rating: 4,
                text: "Great service overall. The technician was knowledgeable and fixed my car on the spot. Only reason for 4 stars is I had to wait a bit longer than expected."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-blue-900">{testimonial.name}</h4>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{testimonial.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "What areas do you cover?",
                answer: "Our breakdown services cover the entire United Kingdom, including all major motorways, A-roads, and remote locations."
              },
              {
                question: "How quickly can I expect assistance?",
                answer: "Our average response time is 30-45 minutes, depending on your location and traffic conditions. In emergency situations on motorways, we prioritize reaching you as quickly as possible."
              },
              {
                question: "What if my car can't be fixed at the roadside?",
                answer: "If we can't fix your vehicle at the roadside, we'll recover it to a garage of your choice within a certain mileage limit (depending on your cover), or to your home address."
              },
              {
                question: "Is there a limit to how many callouts I can make?",
                answer: "Standard cover includes up to 6 callouts per year. Premium and Ultimate plans offer unlimited callouts."
              },
              {
                question: "Are parts and labour included?",
                answer: "Roadside repairs include labour but not the cost of parts. Any garage repairs will be quoted separately before work begins."
              }
            ].map((faq, index) => (
              <div key={index} className="mb-6 border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions? Contact our customer support team</p>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-md">Contact Support</button>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Protected?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of drivers who trust GB Trader for their breakdown and recovery needs. Sign up today for immediate cover.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-md">Get Covered Now</button>
            <button className="bg-transparent hover:bg-white/10 border-2 border-white text-white font-bold py-3 px-8 rounded-md">View All Plans</button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 