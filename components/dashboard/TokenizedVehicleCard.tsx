"use client"

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Power, 
  PowerOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getTokenStatusIndicator } from '@/lib/utils/tokenUtils';
import { auth } from '@/lib/firebase';

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

  const handleTokenToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      if (tokenStatus === 'active') {
        // Deactivate token using API
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
        } else {
          toast.error(result.error || 'Failed to deactivate listing');
        }
      } else {
        // Activate token
        if (availableTokens <= 0) {
          toast.error('No available tokens. Please upgrade your plan or deactivate other listings.');
          return;
        }

        // Check if token is expired before reactivation
        if (vehicle.tokenExpiryDate && new Date(vehicle.tokenExpiryDate) < new Date()) {
          toast.error('Vehicle token has expired. Please contact support to renew your plan.');
          return;
        }

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
        } else {
          toast.error(result.error || 'Failed to activate listing');
        }
      }
    } catch (error) {
      console.error('Error toggling token status:', error);
      toast.error('Failed to update listing status');
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "sold":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
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
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
            <Badge 
              variant="outline" 
              className={`text-xs border ${getStatusBadgeColor(vehicle.status)}`}
            >
              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {vehicle.views}
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {vehicle.inquiries}
            </span>
          </div>

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
              ? 'Deactivate listing (frees up a token)' 
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
  );
}
