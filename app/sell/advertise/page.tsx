"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/sell/header"
import { ImageUploadSection } from "@/components/sell/image-upload-section"
import { CreateAdButton } from "@/components/sell/create-ad-button"
import { uploadCarImages } from "@/app/actions/car"

export default function Advertise() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleImagesChange = (images: File[]) => {
    setSelectedImages(images)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData()
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    try {
      const result = await uploadCarImages(formData)
      if (result.success) {
        // Redirect to success page or dashboard
        router.push("/sell/success")
      }
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Advertise your vehicle</h1>

          <form onSubmit={handleSubmit}>
            <ImageUploadSection onImagesChange={handleImagesChange} />
            <CreateAdButton isDisabled={selectedImages.length === 0} isLoading={uploading} />
          </form>
        </div>
      </div>
    </div>
  )
}

