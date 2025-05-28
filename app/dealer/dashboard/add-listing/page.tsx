"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddVehicleForm from "@/components/add-listing/AddVehicleForm"
import BulkListing from "@/components/add-listing/bulk-listing"

export default function AddListing() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/dealer/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Add New Listing</CardTitle>
            <CardDescription>
              Create a new vehicle listing or bulk upload existing inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Listing</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <AddVehicleForm />
              </TabsContent>

              <TabsContent value="bulk">
                <BulkListing />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
} 