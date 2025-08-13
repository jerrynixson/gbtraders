"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { 
  Save, 
  X, 
  Settings,
  Phone,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  Upload,
  Camera
} from "lucide-react";

// Available services list (from reference garage pages)
const availableServices = [
  "Electric issue repair",
  "Programming",
  "Commercial vehicle repair",
  "Sunroof repair",
  "Suspension repair",
  "Vehicle diagnostics",
  "Manual Gearbox repair",
  "Automatic Gearbox repair",
  "DPF Cleaning",
  "Starter motor/Alternator Repair",
  "Battery servicing",
  "Air conditioning",
  "Brakes and Clutches",
  "Electric car/van Repair",
  "Hybrid car repair",
  "LPG Repair",
  "Range Rover Specialist",
  "Wheel Alignment",
  "Tyre Change",
  "Car Accessories and Parts",
  "Garage Equipment",
  "Body Repair",
  "MOT",
  "Welding",
  "Turbochargers Repair",
  "Motorcycle repairs & services",
  "Engine repair",
  "Transmission repair",
  "Exhaust repair",
  "Clutch replacement",
  "Brake pad replacement",
  "Oil change",
  "Radiator repair",
  "Windscreen replacement",
  "Paint protection",
  "Detailing services"
];

// Garage type (from reference)
interface Garage {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  coverImage?: string;
  price: string;
  description: string;
  services: string[];
  rating: number;
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  website: string;
  email: string;
  paymentMethods: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export default function AddGaragePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // Mock data for editing (in real app, this would come from API/database)
  const mockGarages = [
    {
      id: "amg-motors",
      name: "AMG Mechanical engineering",
      address: "B12 0DF, Birmingham, West Midlands, England, United Kingdom",
      phone: "+44 121 446 5777",
      image: "/garages/garage1.jpg",
      coverImage: "/garages/garage1-cover.jpg",
      price: "£0.00",
      description: "The mechanics at our shop have over 60 years of experience between them. They are dedicated to providing high-quality repairs to keep you safe and happy.",
      services: ["Electric issue repair", "Programming", "MOT", "Servicing"],
      rating: 4.8,
      openingHours: {
        weekdays: { start: "08:00", end: "18:00" },
        saturday: { start: "09:00", end: "17:00" },
        sunday: { start: "10:00", end: "16:00" }
      },
      website: "www.amgmotors.com",
      email: "info@amgmotors.com",
      paymentMethods: ["Cash", "Credit Card", "Debit Card", "PayPal"],
      socialMedia: {
        facebook: "https://facebook.com/AMGMotors",
        twitter: "https://twitter.com/AMGMotors",
        instagram: "https://instagram.com/AMGMotors"
      }
    }
  ];

  const [form, setForm] = useState<Partial<Garage>>({
    id: "",
    name: "",
    services: [],
    paymentMethods: [],
    socialMedia: {},
    openingHours: {
      weekdays: { start: "08:00", end: "18:00" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "10:00", end: "16:00" }
    }
  });
  const [currentStep, setCurrentStep] = useState(0);

  // Load garage data for editing
  useEffect(() => {
    if (isEditing && editId) {
      const garageToEdit = mockGarages.find(g => g.id === editId);
      if (garageToEdit) {
        setForm(garageToEdit);
      }
    }
  }, [editId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleNestedChange = (field: string, subfield: string, value: string | any) => {
    setForm(f => ({
      ...f,
      [field]: {
        ...((f as any)[field] || {}),
        [subfield]: value
      }
    }));
  };

  const addPaymentMethod = () => {
    setForm(f => ({ ...f, paymentMethods: [...(f.paymentMethods || []), ""] }));
  };

  const removePaymentMethod = (i: number) => {
    setForm(f => ({ ...f, paymentMethods: (f.paymentMethods || []).filter((_, idx) => idx !== i) }));
  };

  const handlePaymentMethodChange = (i: number, value: string) => {
    setForm(f => ({ ...f, paymentMethods: f.paymentMethods ? f.paymentMethods.map((pm, idx) => idx === i ? value : pm) : [] }));
  };

  const handleImageUpload = (type: 'main' | 'cover', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server/cloud storage
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      if (type === 'main') {
        setForm(f => ({ ...f, image: imageUrl }));
      } else {
        setForm(f => ({ ...f, coverImage: imageUrl }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.address && form.phone && form.email && form.image && (form.services || []).length > 0) {
      // Auto-generate ID from name if not editing
      if (!isEditing && !form.id) {
        const generatedId = form.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        setForm(f => ({ ...f, id: generatedId }));
      }
      
      // TODO: Implement garage save logic (API call, etc.)
      console.log(isEditing ? 'Updating garage:' : 'Saving garage:', form);
      alert(isEditing ? 'Garage updated successfully!' : 'Garage created successfully!');
      router.push('/garages/dashboard');
    }
  };

  const steps = [
    { 
      id: 'basic', 
      label: 'Basic Info', 
      icon: Settings,
      description: 'Essential garage information'
    },
    { 
      id: 'contact', 
      label: 'Contact Details', 
      icon: Phone,
      description: 'How customers can reach you'
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Users,
      description: 'What services you offer'
    },
    { 
      id: 'hours', 
      label: 'Opening Hours', 
      icon: Clock,
      description: 'When you are open'
    }
  ];

  // Validation functions for each step
  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        return form.name && form.description && form.image;
      case 1: // Contact
        return form.address && form.phone && form.email;
      case 2: // Services
        return (form.services || []).length > 0;
      case 3: // Hours
        return form.openingHours?.weekdays?.start && form.openingHours?.weekdays?.end;
      default:
        return true;
    }
  };

  const canProceed = () => validateStep(currentStep);
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    console.log('Current step:', currentStep, 'Can proceed:', canProceed());
    console.log('Form validation:', {
      step: currentStep,
      name: !!form.name,
      description: !!form.description,
      image: !!form.image,
      address: !!form.address,
      phone: !!form.phone,
      email: !!form.email,
      services: (form.services || []).length,
      weekdaysStart: !!form.openingHours?.weekdays?.start,
      weekdaysEnd: !!form.openingHours?.weekdays?.end
    });
    
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/garages/dashboard')}
            className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            {/* Step Progress Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="mb-4">
                <p className="text-blue-100 text-sm font-medium">
                  {isEditing ? 'Editing' : 'Creating'} • Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
              
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        getStepStatus(index) === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : getStepStatus(index) === 'current'
                          ? 'bg-white text-blue-600 ring-4 ring-white/30'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        {getStepStatus(index) === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        getStepStatus(index) === 'current' ? 'text-white' : 'text-white/70'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-200 ${
                        getStepStatus(index) === 'completed' ? 'bg-green-400' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Info Step */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isEditing ? "Update garage basics" : "Let's start with the basics"}
                    </h3>
                    <p className="text-gray-600">
                      {isEditing ? "Modify your garage information" : "Tell us about your garage and what makes it special"}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Garage Name *</label>
                      <Input 
                        name="name" 
                        value={form.name || ""} 
                        onChange={handleChange} 
                        placeholder="Enter garage name"
                        required 
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Description *</label>
                    <textarea 
                      name="description" 
                      value={form.description || ""} 
                      onChange={handleChange} 
                      placeholder="Describe your garage, services, and what makes you special..."
                      rows={4}
                      required
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">Images *</label>
                      
                      {/* Main Image Upload */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Main Image *</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                            {form.image ? (
                              <div className="relative">
                                <img 
                                  src={form.image} 
                                  alt="Main garage image" 
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setForm(f => ({ ...f, image: "" }))}
                                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 mb-2">Upload main garage image</p>
                                <p className="text-xs text-gray-500 mb-4">JPG, PNG up to 5MB</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload('main', e)}
                                  className="hidden"
                                  id="main-image-upload"
                                />
                                <label
                                  htmlFor="main-image-upload"
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Image
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Cover Image (Optional)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                            {form.coverImage ? (
                              <div className="relative">
                                <img 
                                  src={form.coverImage} 
                                  alt="Cover garage image" 
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setForm(f => ({ ...f, coverImage: "" }))}
                                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 mb-2">Upload cover image</p>
                                <p className="text-xs text-gray-500 mb-4">Optional banner image</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload('cover', e)}
                                  className="hidden"
                                  id="cover-image-upload"
                                />
                                <label
                                  htmlFor="cover-image-upload"
                                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Cover
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Base Price</label>
                    <Input 
                      name="price" 
                      value={form.price || ""} 
                      onChange={handleChange} 
                      placeholder="£50.00"
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Contact Step */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">How can customers reach you?</h3>
                    <p className="text-gray-600">Provide your contact information and location details</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Address *</label>
                    <textarea 
                      name="address" 
                      value={form.address || ""} 
                      onChange={handleChange} 
                      placeholder="Street address, city, postcode, country"
                      rows={3}
                      required
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                      <Input 
                        name="phone" 
                        value={form.phone || ""} 
                        onChange={handleChange} 
                        placeholder="+44 123 456 7890"
                        required
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                      <Input 
                        name="email" 
                        type="email"
                        value={form.email || ""} 
                        onChange={handleChange} 
                        placeholder="info@garage.com"
                        required
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Website</label>
                    <Input 
                      name="website" 
                      value={form.website || ""} 
                      onChange={handleChange} 
                      placeholder="www.yourgarage.com"
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Social Media (Optional)</label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Facebook</label>
                        <Input 
                          value={form.socialMedia?.facebook || ""} 
                          onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                          placeholder="https://facebook.com/yourgarage"
                          className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Twitter</label>
                        <Input 
                          value={form.socialMedia?.twitter || ""} 
                          onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                          placeholder="https://twitter.com/yourgarage"
                          className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Instagram</label>
                        <Input 
                          value={form.socialMedia?.instagram || ""} 
                          onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                          placeholder="https://instagram.com/yourgarage"
                          className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Payment Methods</label>
                    <div className="space-y-3">
                      {(form.paymentMethods || []).map((method, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <Input 
                            value={method} 
                            onChange={e => handlePaymentMethodChange(i, e.target.value)} 
                            placeholder="e.g., Credit Card"
                            className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => removePaymentMethod(i)} className="rounded-xl border-red-300 text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addPaymentMethod} className="w-full rounded-xl border-dashed border-gray-400 text-gray-600 hover:bg-gray-50">
                        <span className="text-xl mr-2">+</span> Add Payment Method
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Step */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">What services do you offer?</h3>
                    <p className="text-gray-600">Select all the services your garage provides (at least one required)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Select Services ({(form.services || []).length} selected) *
                    </label>
                    
                    {/* Services Grid - Uniform Width Small Boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {availableServices.map((service, i) => {
                        const isSelected = (form.services || []).includes(service);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setForm(f => ({ 
                                  ...f, 
                                  services: (f.services || []).filter(s => s !== service) 
                                }));
                              } else {
                                setForm(f => ({ 
                                  ...f, 
                                  services: [...(f.services || []), service] 
                                }));
                              }
                            }}
                            className={`
                              min-h-[3rem] px-2 py-2 rounded-xl text-sm font-medium text-center
                              transition-all duration-200 border flex items-center justify-center
                              leading-tight break-words hyphens-auto
                              ${isSelected 
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }
                            `}
                            title={service}
                          >
                            <span className="text-center leading-tight">{service}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, services: [] }))}
                        disabled={(form.services || []).length === 0}
                        className="px-3 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const popular = ["MOT", "Servicing", "Brakes", "Tyres", "Battery servicing"];
                          setForm(f => ({ ...f, services: popular }));
                        }}
                        className="px-3 py-1 text-xs rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Popular
                      </button>
                    </div>
                    
                    {(form.services || []).length === 0 && (
                      <p className="text-red-500 text-sm mt-2">Please select at least one service</p>
                    )}
                  </div>
                </div>
              )}

              {/* Hours Step */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">When are you open?</h3>
                    <p className="text-gray-600">Set your business hours so customers know when to visit</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-6">Opening Hours *</label>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="font-semibold text-blue-900">Monday - Friday</span>
                        <Input 
                          type="time"
                          value={form.openingHours?.weekdays?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'weekdays', { 
                            start: e.target.value, 
                            end: form.openingHours?.weekdays?.end || "" 
                          })}
                          required
                          className="rounded-xl border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        />
                        <Input 
                          type="time"
                          value={form.openingHours?.weekdays?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'weekdays', { 
                            start: form.openingHours?.weekdays?.start || "", 
                            end: e.target.value 
                          })}
                          required
                          className="rounded-xl border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="font-semibold text-green-900">Saturday</span>
                        <Input 
                          type="time"
                          value={form.openingHours?.saturday?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'saturday', { 
                            start: e.target.value, 
                            end: form.openingHours?.saturday?.end || "" 
                          })}
                          className="rounded-xl border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
                        />
                        <Input 
                          type="time"
                          value={form.openingHours?.saturday?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'saturday', { 
                            start: form.openingHours?.saturday?.start || "", 
                            end: e.target.value 
                          })}
                          className="rounded-xl border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="font-semibold text-amber-900">Sunday</span>
                        <Input 
                          type="time"
                          value={form.openingHours?.sunday?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'sunday', { 
                            start: e.target.value, 
                            end: form.openingHours?.sunday?.end || "" 
                          })}
                          className="rounded-xl border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-white"
                        />
                        <Input 
                          type="time"
                          value={form.openingHours?.sunday?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'sunday', { 
                            start: form.openingHours?.sunday?.start || "", 
                            end: e.target.value 
                          })}
                          className="rounded-xl border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                {/* Left Side - Previous Button */}
                <div className="flex-1">
                  {currentStep > 0 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="px-6 py-2.5 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                      ← Previous
                    </Button>
                  ) : (
                    <div></div>
                  )}
                </div>
                
                {/* Right Side - Cancel & Next/Submit */}
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/garages/dashboard')} 
                    className="px-6 py-2.5 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </Button>
                  
                  <div className="relative">
                    {/* Error Message */}
                    {!canProceed() && !isLastStep && (
                      <div className="absolute -top-8 right-0 bg-red-50 border border-red-200 rounded-md px-3 py-1">
                        <p className="text-red-600 text-xs font-medium whitespace-nowrap">Complete required fields to continue</p>
                      </div>
                    )}
                    
                    {/* Next/Submit Button */}
                    {isLastStep ? (
                      <Button 
                        type="submit" 
                        disabled={!canProceed()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? 'Update Garage' : 'Create Garage'}
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        Next →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
