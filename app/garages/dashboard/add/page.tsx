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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  createGarage, 
  updateGarage, 
  getGarageById 
} from "@/lib/garage";
import { type Garage, AVAILABLE_SERVICES } from "@/lib/types/garage";

export default function AddGaragePage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [form, setForm] = useState<Partial<Garage>>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    services: [],
    rating: 0,
    price: "£0.00",
    paymentMethods: [],
    socialMedia: {},
    openingHours: {
      weekdays: { start: "", end: "" },
      saturday: { start: "", end: "" },
      sunday: { start: "", end: "" }
    }
    // DO NOT include image or coverImage in initial state - they'll be handled separately
  });
  
  // File handling states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission guard
  const [manualSubmitAttempted, setManualSubmitAttempted] = useState(false); // Track manual submission attempts

  // Load garage data for editing
  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (isEditing && editId) {
      const loadGarageData = async () => {
        try {
          setLoading(true);
          const garage = await getGarageById(editId);
          if (garage && garage.ownerId === user.uid) {
            // Clean the garage data before setting form state
            const cleanGarageData = Object.fromEntries(
              Object.entries(garage).filter(([key, value]) => {
                // Keep all fields except id and image fields
                if (key === 'id') return false;
                if (key === 'image' || key === 'coverImage') return false;
                return value !== undefined;
              })
            );
            
            setForm(cleanGarageData);
            
            // Handle existing images separately - don't put them in form data
            if (garage.image) {
              console.log('Existing main image:', garage.image);
              // Store reference for display but don't set in form
            }
            if (garage.coverImage) {
              console.log('Existing cover image:', garage.coverImage);
              // Store reference for display but don't set in form
            }
          } else {
            toast.error('Garage not found or access denied');
            router.push('/garages/dashboard');
          }
        } catch (error) {
          console.error('Error loading garage:', error);
          toast.error('Failed to load garage data');
          router.push('/garages/dashboard');
        } finally {
          setLoading(false);
        }
      };
      
      loadGarageData();
    }
  }, [user, isEditing, editId, router]);

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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (type === 'main') {
        setImageFile(file);
        // Create preview URL for display only
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Clean up previous preview URL
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        
        console.log('Main image file selected:', file.name);
        // DO NOT modify form data with blob URLs or undefined values
      } else {
        setCoverImageFile(file);
        // Create preview URL for display only
        const previewUrl = URL.createObjectURL(file);
        setCoverImagePreview(previewUrl);
        
        // Clean up previous preview URL
        if (coverImagePreview) {
          URL.revokeObjectURL(coverImagePreview);
        }
        
        console.log('Cover image file selected:', file.name);
        // DO NOT modify form data with blob URLs or undefined values
      }
    }
  };

  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [imagePreview, coverImagePreview]);

  // Form submission handler that only allows submission on final step
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    
    // Prevent submission if we just got to the last step
    const justReachedFinalStep = currentStep === steps.length - 1 && 
      (!form.openingHours?.weekdays?.start || !form.openingHours?.weekdays?.end);
      
    if (justReachedFinalStep) {
      console.log('Preventing submission on initial load of step 4');
      return false;
    }
    
    // Only allow submission on the last step
    if (currentStep !== steps.length - 1) {
      console.log('Form submission blocked - not on final step');
      return false;
    }
    
    // Call the actual submit handler
    handleSubmit(e);
  };

  // Add keyboard handler to prevent Enter key from submitting form early
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== steps.length - 1) {
      e.preventDefault();
      if (canProceed()) {
        nextStep();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring...');
      return;
    }
    
    // Additional safety check: only proceed if manual submission was attempted
    // This prevents automatic submission when reaching step 4
    if (currentStep === steps.length - 1 && !manualSubmitAttempted) {
      console.log('Blocking auto-submission - manual submit not attempted');
      return;
    }
    
    if (!user) {
      toast.error('Please sign in to save your garage');
      return;
    }

    if (!form.name || !form.address || !form.phone || !form.email || !form.services?.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check that all opening hours are filled
    if (
      !form.openingHours?.weekdays?.start || 
      !form.openingHours?.weekdays?.end || 
      !form.openingHours?.saturday?.start || 
      !form.openingHours?.saturday?.end || 
      !form.openingHours?.sunday?.start || 
      !form.openingHours?.sunday?.end
    ) {
      toast.error('Please fill in all opening hours fields');
      return;
    }

    try {
      setIsSubmitting(true); // Set submission guard
      setSaving(true);
      
      // Clean form data to remove undefined fields and image fields
      const cleanFormData = Object.fromEntries(
        Object.entries(form).filter(([key, value]) => {
          // Remove undefined values
          if (value === undefined) return false;
          // Remove image fields - they'll be handled separately as files
          if (key === 'image' || key === 'coverImage') return false;
          return true;
        })
      ) as Partial<Garage>;

      console.log('Submitting clean form data:', cleanFormData);
      console.log('Image file:', imageFile);
      console.log('Cover image file:', coverImageFile);
      
      if (isEditing && editId) {
        // Update existing garage with image files
        await updateGarage(editId, cleanFormData, user.uid, imageFile || undefined, coverImageFile || undefined);
        toast.success('Garage updated successfully!');
      } else {
        // Create new garage with image files
        const newGarageId = await createGarage(cleanFormData, user.uid, imageFile || undefined, coverImageFile || undefined);
        console.log('Garage created with ID:', newGarageId);
        toast.success('Garage created successfully!');
      }
      
      router.push('/garages/dashboard');
    } catch (error) {
      console.error('Error saving garage:', error);
      toast.error('Failed to save garage. Please try again.');
    } finally {
      setSaving(false);
      setIsSubmitting(false); // Clear submission guard
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
        return form.name && form.description; // Remove image requirement
      case 1: // Contact
        return form.address && form.phone && form.email;
      case 2: // Services
        return (form.services || []).length > 0;
      case 3: // Hours
        return (
          // Validate weekdays
          form.openingHours?.weekdays?.start && 
          form.openingHours?.weekdays?.end &&
          // Validate Saturday
          form.openingHours?.saturday?.start && 
          form.openingHours?.saturday?.end &&
          // Validate Sunday
          form.openingHours?.sunday?.start && 
          form.openingHours?.sunday?.end
        );
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
      address: !!form.address,
      phone: !!form.phone,
      email: !!form.email,
      services: (form.services || []).length,
      weekdaysStart: !!form.openingHours?.weekdays?.start,
      weekdaysEnd: !!form.openingHours?.weekdays?.end
    });
    
    if (canProceed() && currentStep < steps.length - 1) {
      // If moving to step 4 (opening hours), add a small delay to prevent auto-submission
      if (currentStep === 2) {
        // Going to step 3 (opening hours)
        console.log('Adding delay before navigating to opening hours step');
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, 100);
      } else {
        setCurrentStep(currentStep + 1);
      }
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

            <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="p-8">
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
                      <label className="block text-sm font-semibold text-gray-700 mb-4">Images (Optional)</label>
                      
                      {/* Main Image Upload */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Main Image</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                            {imagePreview || form.image ? (
                              <div className="relative">
                                <img 
                                  src={imagePreview || form.image} 
                                  alt="Main garage image" 
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setImageFile(null);
                                    setImagePreview('');
                                    // Clean up preview URL
                                    if (imagePreview) {
                                      URL.revokeObjectURL(imagePreview);
                                    }
                                    // DO NOT modify form data - let it remain without image field
                                  }}
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
                            {coverImagePreview || form.coverImage ? (
                              <div className="relative">
                                <img 
                                  src={coverImagePreview || form.coverImage} 
                                  alt="Cover garage image" 
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCoverImageFile(null);
                                    setCoverImagePreview('');
                                    // Clean up preview URL
                                    if (coverImagePreview) {
                                      URL.revokeObjectURL(coverImagePreview);
                                    }
                                    // DO NOT modify form data - let it remain without coverImage field
                                  }}
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
                      {AVAILABLE_SERVICES.map((service, i) => {
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
                    <p className="text-gray-600">Set your business hours so customers know when to visit (use 24-hour format: e.g., 09:00, 17:30)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-6">Opening Hours *</label>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="font-semibold text-blue-900">Monday - Friday</span>
                        <Input 
                          type="text"
                          value={form.openingHours?.weekdays?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'weekdays', { 
                            start: e.target.value, 
                            end: form.openingHours?.weekdays?.end || "" 
                          })}
                          placeholder="09:00"
                          required
                          className="rounded-xl border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        />
                        <Input 
                          type="text"
                          value={form.openingHours?.weekdays?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'weekdays', { 
                            start: form.openingHours?.weekdays?.start || "", 
                            end: e.target.value 
                          })}
                          placeholder="17:30"
                          required
                          className="rounded-xl border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="font-semibold text-green-900">Saturday</span>
                        <Input 
                          type="text"
                          value={form.openingHours?.saturday?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'saturday', { 
                            start: e.target.value, 
                            end: form.openingHours?.saturday?.end || "" 
                          })}
                          placeholder="09:00"
                          required
                          className="rounded-xl border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
                        />
                        <Input 
                          type="text"
                          value={form.openingHours?.saturday?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'saturday', { 
                            start: form.openingHours?.saturday?.start || "", 
                            end: e.target.value 
                          })}
                          placeholder="17:30"
                          required
                          className="rounded-xl border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="font-semibold text-amber-900">Sunday</span>
                        <Input 
                          type="text"
                          value={form.openingHours?.sunday?.start || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'sunday', { 
                            start: e.target.value, 
                            end: form.openingHours?.sunday?.end || "" 
                          })}
                          placeholder="10:00"
                          required
                          className="rounded-xl border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-white"
                        />
                        <Input 
                          type="text"
                          value={form.openingHours?.sunday?.end || ""} 
                          onChange={(e) => handleNestedChange('openingHours', 'sunday', { 
                            start: form.openingHours?.sunday?.start || "", 
                            end: e.target.value 
                          })}
                          placeholder="16:00"
                          required
                          className="rounded-xl border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>
                    
                    {/* Time format help */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Time Format:</strong> Use 24-hour format (HH:MM) - Examples: 09:00, 13:30, 17:45
                      </p>
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
                        disabled={!canProceed() || isSubmitting}
                        onClick={() => setManualSubmitAttempted(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting 
                          ? (isEditing ? 'Updating...' : 'Creating...') 
                          : (isEditing ? 'Update Garage' : 'Create Garage')
                        }
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
