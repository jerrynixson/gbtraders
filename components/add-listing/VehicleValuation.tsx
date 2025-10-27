"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DollarSign, RefreshCw, AlertCircle, Info } from "lucide-react"

interface VehicleValuationProps {
  registrationNumber: string
  mileage: string
  onPriceEstimate: (price: number) => void
}

export function VehicleValuation({ 
  registrationNumber, 
  mileage, 
  onPriceEstimate 
}: VehicleValuationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [error, setError] = useState<string>("")

  const handleGetValuation = async () => {
    // Validation
    if (!registrationNumber.trim()) {
      setError("Please enter a registration number above")
      return
    }

    if (!mileage.trim() || isNaN(Number(mileage))) {
      setError("Please enter a valid mileage")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reg: registrationNumber,
          mileage: Number(mileage),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch valuation')
      }

      const data = await response.json()
      
      if (data.trade_retail) {
        setEstimatedPrice(data.trade_retail)
        onPriceEstimate(data.trade_retail)
        setError("")
      } else {
        throw new Error('Invalid response from valuation service')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get valuation')
      setEstimatedPrice(null)
    } finally {
      setIsLoading(false)
    }
  }

  const canGetValuation = registrationNumber.trim() && mileage.trim() && !isNaN(Number(mileage))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-gray-500" />
        <h4 className="text-sm font-medium">Price Estimation</h4>
      </div>

      {!canGetValuation && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm">
            Enter registration number and mileage above to get an estimated trade retail price.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          {estimatedPrice !== null && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Estimated Trade Retail Price</Label>
              <div className="text-2xl font-bold text-green-600">
                £{estimatedPrice.toLocaleString()}
              </div>
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleGetValuation}
          disabled={!canGetValuation || isLoading}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Getting Valuation...
            </>
          ) : (
            <>
              Get Valuation
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {estimatedPrice !== null && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 text-sm">
            ✓ Price estimated successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
