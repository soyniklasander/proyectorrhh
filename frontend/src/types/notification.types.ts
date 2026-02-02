export interface NotificationAction {
  key: string;
  label: string;
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error' | 'default';
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
