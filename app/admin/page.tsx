"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertCircle, Building2, Car } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/hooks/useAdmin";
import { AddAdminForm } from "@/components/admin/add-admin-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  category: string;
}

interface Dealer {
  id: string;
  businessName: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  location: {
    addressLines: string[];
  };
  businessHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'vehicle' | 'dealer', data: Vehicle | Dealer } | null>(null);

  useEffect(() => {
    if (adminLoading) return;

    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch vehicles
        const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
        const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Vehicle[];

        // Fetch dealers
        const dealersSnapshot = await getDocs(collection(db, "dealers"));
        const dealersData = dealersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dealer[];

        setVehicles(vehiclesData);
        setDealers(dealersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, adminLoading, router, toast]);

  const handleDelete = (type: 'vehicle' | 'dealer', item: Vehicle | Dealer) => {
    setSelectedItem({ type, data: item });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const collectionName = selectedItem.type === 'vehicle' ? 'vehicles' : 'dealers';
      await deleteDoc(doc(db, collectionName, selectedItem.data.id));
      
      if (selectedItem.type === 'vehicle') {
        setVehicles(vehicles.filter(v => v.id !== selectedItem.data.id));
      } else {
        setDealers(dealers.filter(d => d.id !== selectedItem.data.id));
      }

      toast({
        title: "Success",
        description: `${selectedItem.type === 'vehicle' ? 'Vehicle' : 'Dealer'} has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Add Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Management</CardTitle>
        </CardHeader>
        <CardContent>
          <AddAdminForm />
        </CardContent>
      </Card>

      {/* Tabs for Vehicles and Dealers */}
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="dealers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dealers
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Vehicle Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vehicle listings found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>{vehicle.make}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>£{vehicle.price.toLocaleString()}</TableCell>
                        <TableCell>{vehicle.category}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('vehicle', vehicle)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealers Tab */}
        <TabsContent value="dealers">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Dealer Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : dealers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No dealers found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Business Hours</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell>{dealer.businessName}</TableCell>
                        <TableCell>{dealer.contact.email}</TableCell>
                        <TableCell>{dealer.contact.phone}</TableCell>
                        <TableCell>{dealer.location.addressLines.join(', ')}</TableCell>
                        <TableCell>{dealer.businessHours.mondayToFriday}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('dealer', dealer)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {selectedItem?.type}
              {selectedItem?.type === 'vehicle' && selectedItem.data && ` ${(selectedItem.data as Vehicle).make} ${(selectedItem.data as Vehicle).model}`}
              {selectedItem?.type === 'dealer' && selectedItem.data && ` ${(selectedItem.data as Dealer).businessName}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 