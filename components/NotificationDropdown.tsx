"use client"

import React from 'react';
import { useNotifications } from './NotificationProvider';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      // You could show a toast error here
    }
  };

  const recentNotifications = notifications.slice(0, 10); // Show last 10 notifications

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No notifications yet</p>
            <p className="text-xs text-gray-500 mt-1">
              You'll see notifications here when you receive offers or responses
            </p>
          </div>
        ) : (
          <div>
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-blue-600 hover:text-blue-700 text-sm"
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}