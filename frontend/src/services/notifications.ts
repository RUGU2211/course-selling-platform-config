// Notification service client
import { apiFetch } from './api';

export type NotificationItem = {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type?: 'IN_APP' | 'EMAIL' | 'SMS' | string;
  read?: boolean;
  createdAt?: string;
};

export async function sendNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<NotificationItem> {
  const path = `/notification-service/api/notifications/send`;
  return apiFetch<NotificationItem>(path, {
    method: 'POST',
    body: JSON.stringify({ ...item, type: item.type || 'IN_APP' }),
  });
}

export async function getUserNotifications(userId: number): Promise<NotificationItem[]> {
  const path = `/notification-service/api/notifications/user/${userId}`;
  return apiFetch<NotificationItem[]>(path);
}

export async function markNotificationRead(id: number): Promise<void> {
  const path = `/notification-service/api/notifications/${id}/read`;
  await apiFetch<void>(path, { method: 'PUT' });
}

export async function deleteNotification(id: number): Promise<void> {
  const path = `/notification-service/api/notifications/${id}`;
  await apiFetch<void>(path, { method: 'DELETE' });
}