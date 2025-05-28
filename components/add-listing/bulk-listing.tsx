"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileSpreadsheet, Database } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"

interface BulkUploadStatus {
  total: number
  processed: number
  success: number
  failed: number
  errors: string[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function BulkListing() {
  const router = useRouter()
  const [bulkUploadStatus, setBulkUploadStatus] = useState<BulkUploadStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onBulkDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)")
      return
    }
    handleBulkFileUpload(file)
  }, [])

  const { getRootProps: getBulkRootProps, getInputProps: getBulkInputProps, isDragActive: isBulkDragActive } = useDropzone({
    onDrop: onBulkDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleBulkFileUpload = async (file: File) => {
    setIsUploading(true)
    setBulkUploadStatus({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      errors: []
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBulkUploadStatus({
        total: 100,
        processed: 50,
        success: 45,
        failed: 5,
        errors: ["Row 10: Invalid VIN", "Row 23: Missing Price"]
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBulkUploadStatus(prev => ({ ...prev!, processed: 100, success: 90, failed: 10 }))

      toast.success("Bulk file processing complete. Check status for details.")
    } catch (error) {
      toast.error("Failed to process bulk file")
      console.error("Error processing bulk file:", error)
      setBulkUploadStatus(prev => ({ ...(prev || { total: 0, processed: 0, success: 0, failed: 0, errors: [] }), errors: [...(prev?.errors || []), "An unexpected error occurred."] }))
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    toast.info("Template download started. (Placeholder)")
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Guidelines</AlertTitle>
        <AlertDescription>
          Make sure your Excel file follows the required format. Download the template for reference.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Template
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info("Viewing documentation. (Placeholder)")}>
          <Database className="w-4 h-4 mr-2" />
          View Documentation
        </Button>
      </div>

      <div
        {...getBulkRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isBulkDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <input {...getBulkInputProps()} />
        <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {isBulkDragActive
            ? "Drop the Excel file here"
            : "Drag and drop your Excel file here, or click to select"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supported formats: .xlsx, .xls
        </p>
      </div>

      {isUploading && <Progress value={bulkUploadStatus ? (bulkUploadStatus.processed / (bulkUploadStatus.total || 1)) * 100 : 0} className="w-full" />}

      {bulkUploadStatus && !isUploading && (
        <div className="space-y-2">
          <h4 className="font-medium">Upload Status:</h4>
          <div className="flex justify-between text-sm">
            <span>Total Records: {bulkUploadStatus.total}</span>
            <span>Processed: {bulkUploadStatus.processed}</span>
          </div>
          <Progress value={(bulkUploadStatus.processed / (bulkUploadStatus.total || 1)) * 100} />
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Successful: {bulkUploadStatus.success}</span>
            <span className="text-red-600">Failed: {bulkUploadStatus.failed}</span>
          </div>
          {bulkUploadStatus.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errors Found</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                  {bulkUploadStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dealer/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
} 