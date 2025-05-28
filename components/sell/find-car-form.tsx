"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { findCarByRegistration } from "@/app/actions/car"

export function FindCarForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await findCarByRegistration(formData)
      if (result.success) {
        // Store car details in session storage for the next step
        sessionStorage.setItem("carDetails", JSON.stringify(result.car))
        router.push("/sell/advertise")
      }
    } catch (error) {
      console.error("Error finding car:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label htmlFor="registration" className="block text-sm mb-2">
            Registration number*
          </label>
          <Input id="registration" name="registration" required className="w-full" />
        </div>

        <div>
          <label htmlFor="mileage" className="block text-sm mb-2">
            Current mileage*
          </label>
          <Input id="mileage" name="mileage" type="number" required className="w-full" />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Finding your car..." : "Find my car"}
        </Button>
      </div>
    </form>
  )
}

