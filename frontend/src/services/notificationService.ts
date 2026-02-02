import api from './api';
import type { NotificationResponse } from '@/types/notification.types';

export const notificationService = {
  getAll: (page = 1, limit = 20) => api.get<NotificationResponse>('/notifications', { params: { page, limit } }),
  markAsRead: (id: string) => api.put<{ success: boolean }>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put<{ success: boolean }>('/notifications/read-all'),
  delete: (id: string) => api.delete<{ success: boolean }>(`/notifications/${id}`),
};
