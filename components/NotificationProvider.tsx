"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types/notifications';
import { 
  fetchUserNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/lib/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time listeners when user is authenticated
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Set up notifications listener
    const unsubscribeNotifications = fetchUserNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoading(false);
      }
    );

    // Set up unread count listener
    const unsubscribeUnreadCount = getUnreadNotificationCount(
      user.uid,
      (count) => {
        setUnreadCount(count);
      }
    );

    // Cleanup listeners on unmount or user change
    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await markAllNotificationsAsRead(user.uid);
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const refreshNotifications = () => {
    // The real-time listeners will automatically refresh the data
    // This function is here for potential manual refresh scenarios
    if (user?.uid) {
      setIsLoading(true);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}