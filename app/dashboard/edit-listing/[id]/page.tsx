"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import AddVehicleForm from "@/components/add-listing/AddVehicleForm"

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const resolvedParams = use(params)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Vehicle Listing</h1>
          <p className="text-gray-600">Update your vehicle information and images</p>
        </div>
        
        <AddVehicleForm 
          vehicleId={resolvedParams.id} 
          isEditMode={true} 
        />
      </main>
      <Footer />
    </div>
  )
}