import { apiService } from './api';
import { 
  Notification, 
  PaginatedResponse, 
  PaginationParams 
} from '../types';

class NotificationService {
  private readonly BASE_PATH = '/notifications';

  // Notification operations
  async getMyNotifications(pagination?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Notification>>(`${this.BASE_PATH}/my-notifications`, params);
    return response.data;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`${this.BASE_PATH}/unread`);
    return response.data;
  }

  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiService.get<Notification>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async markAsRead(id: number): Promise<Notification> {
    const response = await apiService.put<Notification>(`${this.BASE_PATH}/${id}/read`);
    return response.data;
  }

  async markAsUnread(id: number): Promise<Notification> {
    const response = await apiService.put<Notification>(`${this.BASE_PATH}/${id}/unread`);
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/mark-all-read`);
  }

  async deleteNotification(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async deleteAllRead(): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/delete-all-read`);
  }

  // Notification preferences
  async getNotificationPreferences(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    courseUpdates: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/preferences`);
    return response.data;
  }

  async updateNotificationPreferences(preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    courseUpdates?: boolean;
    paymentNotifications?: boolean;
    marketingEmails?: boolean;
    weeklyDigest?: boolean;
  }): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/preferences`, preferences);
  }

  // Admin methods
  async sendNotificationToUser(userId: number, notification: {
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  }): Promise<Notification> {
    const response = await apiService.post<Notification>(`${this.BASE_PATH}/send-to-user`, {
      userId,
      ...notification,
    });
    return response.data;
  }

  async sendBulkNotification(notification: {
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    userIds?: number[];
    roles?: string[];
    courseIds?: number[];
  }): Promise<{
    sentCount: number;
    failedCount: number;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/send-bulk`, notification);
    return response.data;
  }

  async sendCourseNotification(courseId: number, notification: {
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  }): Promise<{
    sentCount: number;
    failedCount: number;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/send-to-course`, {
      courseId,
      ...notification,
    });
    return response.data;
  }

  async getAllNotifications(pagination?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Notification>>(`${this.BASE_PATH}/all`, params);
    return response.data;
  }

  async getNotificationStats(): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: { type: string; count: number }[];
    dailyNotifications: { date: string; count: number }[];
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/stats`);
    return response.data;
  }

  // Real-time notifications (WebSocket/SSE)
  async subscribeToNotifications(onNotification: (notification: Notification) => void): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement a polling mechanism
    const eventSource = new EventSource(`${apiService.getBaseURL()}${this.BASE_PATH}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Notification stream error:', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>(`${this.BASE_PATH}/unread-count`);
    return response.data.count;
  }

  // Email notifications
  async sendEmailNotification(userId: number, emailData: {
    subject: string;
    template: string;
    data: any;
  }): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/send-email`, {
      userId,
      ...emailData,
    });
  }

  async sendBulkEmail(emailData: {
    subject: string;
    template: string;
    data: any;
    userIds?: number[];
    roles?: string[];
  }): Promise<{
    sentCount: number;
    failedCount: number;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/send-bulk-email`, emailData);
    return response.data;
  }

  // Push notifications
  async registerPushSubscription(subscription: PushSubscription): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/push-subscription`, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh'),
        auth: subscription.getKey('auth'),
      },
    });
  }

  async unregisterPushSubscription(): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/push-subscription`);
  }

  async sendPushNotification(userId: number, pushData: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/send-push`, {
      userId,
      ...pushData,
    });
  }

  // Notification templates
  async getNotificationTemplates(): Promise<{
    id: string;
    name: string;
    subject: string;
    template: string;
    type: string;
  }[]> {
    const response = await apiService.get(`${this.BASE_PATH}/templates`);
    return response.data;
  }

  async createNotificationTemplate(template: {
    name: string;
    subject: string;
    template: string;
    type: string;
  }): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/templates`, template);
  }

  async updateNotificationTemplate(id: string, template: {
    name?: string;
    subject?: string;
    template?: string;
    type?: string;
  }): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/templates/${id}`, template);
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/templates/${id}`);
  }
}

export const notificationService = new NotificationService();
export default notificationService;