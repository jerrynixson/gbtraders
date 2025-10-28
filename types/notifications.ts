import { Timestamp } from "firebase/firestore";

export type NotificationType = 
  | 'offer_received' 
  | 'offer_accepted' 
  | 'offer_declined';

export interface NotificationData {
  offerId: string;
  vehicleId: string;
  vehicleMake?: string;
  vehicleModel?: string;
  offerAmount?: number;
}

export interface Notification {
  id: string;
  userId: string; // recipient of notification
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  createdAt: Timestamp;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  data: NotificationData;
}