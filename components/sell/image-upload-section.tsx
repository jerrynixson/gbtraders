"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash2 } from "lucide-react"

type ImageUploadSectionProps = {
  onImagesChange: (images: File[]) => void
}

export function ImageUploadSection({ onImagesChange }: ImageUploadSectionProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      const updatedImages = [...selectedImages, ...newImages]
      setSelectedImages(updatedImages)
      onImagesChange(updatedImages)
    }
  }

  const handleRemoveImages = () => {
    setSelectedImages([])
    onImagesChange([])
  }

  return (
    <div className="border rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">Add Images</h2>
      <p className="text-sm text-gray-600 mb-6">
        Add as many images as possible of the vehicle of all its components such as interiors, exteriors, engine,
        wheels, etc. to maintain transparency between the buyer and the dealer.
      </p>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={URL.createObjectURL(image) || "/placeholder.svg"}
                alt={`Selected image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById("image-input")?.click()}
          className="bg-blue-100 hover:bg-blue-200 text-primary"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Add Images
        </Button>
        <input id="image-input" type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

        <Button
          type="button"
          variant="secondary"
          onClick={handleRemoveImages}
          className="bg-blue-100 hover:bg-blue-200 text-primary"
          disabled={selectedImages.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Images
        </Button>
      </div>
    </div>
  )
}

