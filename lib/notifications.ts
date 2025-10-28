import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  writeBatch, 
  getDocs,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { 
  Notification, 
  NotificationType, 
  NotificationData, 
  CreateNotificationParams 
} from "@/types/notifications";

// Helper function to generate notification title and message
function getNotificationContent(type: NotificationType, data: NotificationData) {
  const vehicleName = data.vehicleMake && data.vehicleModel 
    ? `${data.vehicleMake} ${data.vehicleModel}` 
    : 'vehicle';

  switch (type) {
    case 'offer_received':
      return {
        title: 'New Offer Received',
        message: `You received a £${data.offerAmount?.toLocaleString()} offer on your ${vehicleName}`
      };
    case 'offer_accepted':
      return {
        title: 'Offer Accepted',
        message: `Your offer of £${data.offerAmount?.toLocaleString()} on the ${vehicleName} has been accepted!`
      };
    case 'offer_declined':
      return {
        title: 'Offer Declined',
        message: `Your offer of £${data.offerAmount?.toLocaleString()} on the ${vehicleName} has been declined`
      };
    default:
      return {
        title: 'Notification',
        message: 'You have a new notification'
      };
  }
}

// Create a new notification
export async function createNotification({
  userId,
  type,
  data
}: CreateNotificationParams): Promise<string> {
  try {
    const { title, message } = getNotificationContent(type, data);
    
    const notificationRef = await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: serverTimestamp()
    });

    return notificationRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Mark a specific notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // Note: This is a simplified implementation. In production, you might want to
    // use a cloud function for this to avoid hitting client-side limits
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    // For now, we'll fetch and update. Consider using a cloud function for better performance
    const snapshot = await getDocs(notificationsQuery);
    
    snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

// Get user notifications with real-time listener
export function fetchUserNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 50
) {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  // Return the unsubscribe function
  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      
      callback(notifications);
    },
    (error) => {
      console.error("Error fetching notifications:", error);
      callback([]); // Return empty array on error
    }
  );
}

// Get unread notification count
export function getUnreadNotificationCount(
  userId: string,
  callback: (count: number) => void
) {
  const unreadQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  return onSnapshot(
    unreadQuery,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error("Error fetching unread count:", error);
      callback(0);
    }
  );
}

// Helper function to format relative time
export function formatRelativeTime(timestamp: Timestamp): string {
  if (!timestamp || !timestamp.toDate) {
    return 'Just now';
  }

  const now = new Date();
  const notificationTime = timestamp.toDate();
  const diffInMs = now.getTime() - notificationTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return notificationTime.toLocaleDateString();
  }
}