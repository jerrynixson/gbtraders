"use client";

import { useEffect, useState, useMemo } from "react";
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
import { sortVehiclesLocally, type SortOptions } from "@/lib/search/searchServices";
import { VehicleSummary } from "@/types/vehicles";
import { Checkbox } from "@/components/ui/checkbox";
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
  mileage?: number;
  createdAt: Date; // Required field
  updatedAt?: Date;
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
  
  // Bulk delete state
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  // Sort state for vehicles
  const [vehicleSortOptions, setVehicleSortOptions] = useState<SortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });

  // Sort vehicles using the sorting function
  const sortedVehicles = useMemo(() => {
    // Convert Vehicle[] to VehicleSummary[] for sorting compatibility
    const vehicleSummaries: VehicleSummary[] = vehicles.map(vehicle => ({
      ...vehicle,
      type: 'car' as const, // Default type since we don't have it in admin vehicle interface
      color: 'Unknown', // Default color
      location: {
        coordinates: { latitude: 0, longitude: 0 }
      },
      mainImage: '',
      mileage: vehicle.mileage || 0,
      createdAt: vehicle.createdAt, // Already guaranteed to be Date
      updatedAt: vehicle.updatedAt || new Date()
    }));
    
    return sortVehiclesLocally(vehicleSummaries, vehicleSortOptions);
  }, [vehicles, vehicleSortOptions]);

  // Handle sort changes
  const handleVehicleSortChange = (value: string) => {
    const [field, direction] = value.split(':') as [SortOptions['field'], SortOptions['direction']];
    setVehicleSortOptions({ field, direction });
  };

  // Handle checkbox selection
  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (checked) {
      newSelected.add(vehicleId);
    } else {
      newSelected.delete(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allVehicleIds = new Set(sortedVehicles.map(v => v.id));
      setSelectedVehicles(allVehicleIds);
    } else {
      setSelectedVehicles(new Set());
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedVehicles.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedVehicles).map(vehicleId => 
        deleteDoc(doc(db, 'vehicles', vehicleId))
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      setVehicles(vehicles.filter(v => !selectedVehicles.has(v.id)));
      setSelectedVehicles(new Set());
      
      toast({
        title: "Success",
        description: `${selectedVehicles.size} vehicle${selectedVehicles.size > 1 ? 's' : ''} have been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to delete some vehicles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

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
        const vehiclesData = vehiclesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            make: data.make || '',
            model: data.model || '',
            year: data.year || 0,
            price: data.price || 0,
            mileage: data.mileage,
            // Ensure createdAt is always a Date object
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          };
        }) as Vehicle[];

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

  // Clear selections when vehicles data changes
  useEffect(() => {
    setSelectedVehicles(new Set());
  }, [vehicles]);

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Vehicle Listings</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {loading ? 'Loading...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`}
                  </p>
                  {selectedVehicles.size > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      {selectedVehicles.size} vehicle{selectedVehicles.size !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedVehicles.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="mr-2"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedVehicles.size})
                    </Button>
                  )}
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={`${vehicleSortOptions.field}:${vehicleSortOptions.direction}`}
                    onChange={(e) => handleVehicleSortChange(e.target.value)}
                    className="border rounded-lg px-3 py-1 text-sm min-w-0"
                    aria-label="Sort vehicles by"
                    disabled={loading || vehicles.length === 0}
                  >
                    <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option>
                    <option value="year:desc">Year: Newest First</option>
                    <option value="year:asc">Year: Oldest First</option>
                    <option value="mileage:asc">Mileage: Low to High</option>
                    <option value="mileage:desc">Mileage: High to Low</option>
                    <option value="createdAt:desc">Most Recent</option>
                  </select>
                </div>
              </div>
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
                      <TableHead className="w-12">
                        <Checkbox
                          checked={sortedVehicles.length > 0 && selectedVehicles.size === sortedVehicles.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all vehicles"
                        />
                      </TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead className="text-center">View</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVehicles.map((sortedVehicle) => {
                      // Find the original vehicle for the delete handler
                      const originalVehicle = vehicles.find(v => v.id === sortedVehicle.id);
                      return (
                        <TableRow key={sortedVehicle.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedVehicles.has(sortedVehicle.id)}
                              onCheckedChange={(checked) => handleSelectVehicle(sortedVehicle.id, checked as boolean)}
                              aria-label={`Select ${sortedVehicle.make} ${sortedVehicle.model}`}
                            />
                          </TableCell>
                          <TableCell>{sortedVehicle.make}</TableCell>
                          <TableCell>{sortedVehicle.model}</TableCell>
                          <TableCell>{sortedVehicle.year}</TableCell>
                          <TableCell>£{sortedVehicle.price.toLocaleString()}</TableCell>
                          <TableCell>{sortedVehicle.mileage ? sortedVehicle.mileage.toLocaleString() + ' mi' : 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push(`/vehicle-info/${sortedVehicle.id}`);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => originalVehicle && handleDelete('vehicle', originalVehicle)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Vehicles?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedVehicles.size} vehicle{selectedVehicles.size > 1 ? 's' : ''}.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 