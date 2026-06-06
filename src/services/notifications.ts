import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { Notification } from '../types';

const COL = 'notifications';

// Create a notification
export const createNotification = async (
  data: Omit<Notification, 'id' | 'createdAt' | 'read'>
) => {
  if (isDemoMode) {
    // In demo mode, just log it
    console.log('Demo: Notification created', data);
    return 'demo-notification-id';
  }

  const payload = {
    ...data,
    read: false,
    createdAt: Date.now(),
  };

  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
};

// Subscribe to user's notifications
export const subscribeNotifications = (
  userId: string,
  onChange: (items: Notification[]) => void
) => {
  if (isDemoMode) {
    // In demo mode, return empty array
    onChange([]);
    return () => {};
  }

  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snap => {
    const items: Notification[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Notification, 'id'>),
    }));
    onChange(items);
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  if (isDemoMode) return;
  await updateDoc(doc(db, COL, notificationId), { read: true });
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string) => {
  if (isDemoMode) return;

  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snap = await getDocs(q);
  await Promise.all(
    snap.docs.map(d => updateDoc(d.ref, { read: true }))
  );
};

// Get unread notification count
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};

// Made with Bob
