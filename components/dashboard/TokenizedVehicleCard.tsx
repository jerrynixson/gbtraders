"use client"

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Power, 
  PowerOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getTokenStatusIndicator } from '@/lib/utils/tokenUtils';
import { auth } from '@/lib/firebase';
import { useRouter } from "next/navigation";

interface TokenizedVehicleCardProps {
  vehicle: {
    id: string;
    title: string;
    price: number;
    image: string;
    make: string;
    model: string;
    year: number;
    status: "active" | "pending" | "sold";
    views: number;
    inquiries: number;
    tokenStatus?: 'active' | 'inactive';
    tokenActivatedDate?: Date;
    tokenExpiryDate?: Date;
    deactivationReason?: string;
  };
  userId: string;
  userType?: 'user' | 'dealer';
  availableTokens: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTokenStatusChange: () => void;
}

export function TokenizedVehicleCard({
  vehicle,
  userId,
  userType = 'dealer',
  availableTokens,
  onEdit,
  onDelete,
  onTokenStatusChange
}: TokenizedVehicleCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const router = useRouter();

  const tokenStatus = vehicle.tokenStatus || 'inactive';
  const statusIndicator = getTokenStatusIndicator(tokenStatus, vehicle.tokenExpiryDate);

  // Fallbacks for vehicle name and image
  const vehicleName = vehicle.title && vehicle.title.trim().length > 0
    ? vehicle.title
    : `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Unnamed Vehicle';
  const vehicleImage = vehicle.image && vehicle.image.trim().length > 0
    ? vehicle.image
    : (Array.isArray((vehicle as any).images) && (vehicle as any).images.length > 0
        ? (vehicle as any).images[0]
        : '/placeholder.jpg');

  const handleDeactivateConfirm = async () => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/activate-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          action: 'deactivate'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Listing deactivated successfully');
        onTokenStatusChange();
        setDeactivateDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to deactivate listing');
      }
    } catch (error) {
      console.error('Error deactivating vehicle:', error);
      toast.error('Failed to deactivate listing');
    } finally {
      setIsToggling(false);
    }
  };

  const handleActivateConfirm = async () => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/activate-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          action: 'activate'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Listing activated successfully');
        onTokenStatusChange();
        setActivateDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to activate listing');
      }
    } catch (error) {
      console.error('Error activating vehicle:', error);
      toast.error('Failed to activate listing');
    } finally {
      setIsToggling(false);
    }
  };

  const handleTokenToggle = async () => {
    if (isToggling) return;

    if (tokenStatus === 'active') {
      // Show deactivation confirmation dialog
      setDeactivateDialogOpen(true);
    } else {
      // Check prerequisites for activation
      if (availableTokens <= 0) {
        toast.error('No available tokens. Please upgrade your plan or deactivate other listings.');
        return;
      }

      // Check if token is expired before reactivation
      if (vehicle.tokenExpiryDate && new Date(vehicle.tokenExpiryDate) < new Date()) {
        toast.error('Vehicle token has expired. Please contact support to renew your plan.');
        return;
      }

      // Show activation confirmation dialog
      setActivateDialogOpen(true);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl border transition-all hover:shadow-sm gap-3 sm:gap-0 ${
          tokenStatus === 'inactive' ? 'border-gray-200 opacity-75' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full">
          {/* Vehicle Image */}
          <div className={`w-full sm:w-24 h-40 sm:h-24 relative rounded-lg overflow-hidden mb-2 sm:mb-0 ${
            tokenStatus === 'inactive' ? 'grayscale' : ''
          }`}>
            <img
              src={vehicleImage}
              alt={vehicleName}
              className="object-cover w-full h-full"
            />
            {/* Token Status Overlay */}
            <div className="absolute top-2 left-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  tokenStatus === 'active' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className={`mr-1 ${statusIndicator.color}`}>
                  {statusIndicator.icon}
                </span>
                {statusIndicator.label}
              </Badge>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{vehicleName}</h3>
              {tokenStatus === 'inactive' && (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              {tokenStatus === 'active' && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            
            <p className="text-lg font-medium text-blue-600 mb-2">
              £{vehicle.price.toLocaleString()}
            </p>

            {/* Token Status Info */}
            {tokenStatus === 'inactive' && vehicle.deactivationReason && (
              <p className="text-xs text-gray-500 mt-1">
                Deactivated: {vehicle.deactivationReason.replace('_', ' ')}
              </p>
            )}
            
            {tokenStatus === 'active' && vehicle.tokenExpiryDate && (
              <p className="text-xs text-gray-500 mt-1">
                Active until: {vehicle.tokenExpiryDate.toLocaleDateString()}
              </p>
            )}

            {tokenStatus === 'inactive' && vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < new Date() && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Token expired: {vehicle.tokenExpiryDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
          {/* Token Toggle Button */}
          <Button
            variant={tokenStatus === 'active' ? 'outline' : 'default'}
            size="sm"
            onClick={handleTokenToggle}
            disabled={
              isToggling || 
              (tokenStatus === 'inactive' && availableTokens <= 0) ||
              (tokenStatus === 'inactive' && vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < new Date())
            }
            className={`min-w-[80px] ${
              tokenStatus === 'active' 
                ? 'hover:bg-red-50 hover:border-red-200 hover:text-red-600' 
                : vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < new Date()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={
              tokenStatus === 'active' 
                ? 'Deactivate listing (token will be lost)' 
                : vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < new Date()
                  ? 'Token has expired - cannot reactivate'
                  : availableTokens <= 0 
                    ? 'No tokens available' 
                    : 'Activate listing (uses 1 token)'
            }
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tokenStatus === 'active' ? (
              <>
                <PowerOff className="w-4 h-4 mr-1" />
                Deactivate
              </>
            ) : vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < new Date() ? (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                Expired
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-1" />
                Activate
              </>
            )}
          </Button>

          {/* View Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/vehicle-info/${vehicle.id}`)}
            className="hover:bg-blue-50 text-blue-600 border-blue-200"
            title="View listing details"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(vehicle.id)}
            className="hover:bg-gray-100"
            title="Edit listing"
          >
            <Edit className="w-4 h-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(vehicle.id)}
            className="hover:bg-red-50 text-red-600"
            title="Delete listing"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Deactivation Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Listing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this listing?<br />
              <span className="text-red-600 font-semibold">The token for this vehicle will be lost and will count against your available tokens when reactivating.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)} disabled={isToggling}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateConfirm}
              disabled={isToggling}
            >
              {isToggling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activation Confirmation Dialog */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Listing?</DialogTitle>
            <DialogDescription>
              This will use 1 token from your available tokens and activate the listing until your current plan expires.<br />
              <span className="text-blue-600 font-semibold">Available tokens: {availableTokens}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setActivateDialogOpen(false)} disabled={isToggling}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleActivateConfirm}
              disabled={isToggling}
            >
              {isToggling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Use 1 Token & Activate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
