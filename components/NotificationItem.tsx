"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types/notifications';
import { formatRelativeTime } from '@/lib/notifications';
import { useNotifications } from './NotificationProvider';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Navigate to relevant page
      if (notification.data.vehicleId) {
        router.push(`/vehicle-info/${notification.data.vehicleId}`);
      }

      // Close dropdown
      onClose?.();
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      if (notification.data.vehicleId) {
        router.push(`/vehicle-info/${notification.data.vehicleId}`);
      }
      onClose?.();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'offer_received':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'offer_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offer_declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    return notification.read ? 'bg-white' : 'bg-blue-50';
  };

  return (
    <div
      onClick={handleClick}
      className={`${getBackgroundColor()} p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm ${notification.read ? 'text-gray-900' : 'text-gray-900 font-medium'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 ml-2"></div>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}