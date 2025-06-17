"use client"

import { useState } from "react"
import { X, Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ContactSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Here you would typically send the form data to your backend
    console.log("Contact form submitted:", formData)
    
    setIsSubmitting(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
    onClose()
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "gbtrader.co.uk@gmail.com",
      action: () => window.open("mailto:gbtrader.co.uk@gmail.com", "_blank"),
      description: "Get a response within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+44 (0121) 456 78 90",
      action: () => window.open("tel:+4401214567890", "_blank"),
      description: "Available Mon-Fri, 9AM-6PM"
    },
    {
      icon: MapPin,
      title: "Office Address",
      value: "84 Bordelsey Street, UK",
      action: () => window.open("https://maps.google.com/?q=84+Bordelsey+Street+UK", "_blank"),
      description: "Visit us in person"
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {contactMethods.map((method, index) => (
              <button
                key={index}
                onClick={method.action}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <method.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <p className="text-blue-600 font-medium">{method.value}</p>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">Or send us a message</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="How can we help you?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please describe your inquiry in detail..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Support Hours */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Support Hours</span>
            </div>
            <p className="text-sm text-gray-600">
              Monday - Friday: 9:00 AM - 6:00 PM GMT<br />
              Saturday: 10:00 AM - 4:00 PM GMT<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 