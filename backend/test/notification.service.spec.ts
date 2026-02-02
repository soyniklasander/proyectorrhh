/// <reference types="jest" />
import { NotificationService } from '../src/services/notification.service';
import { Env } from '../src/types';

// Mock D1Database
const mockD1 = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  all: jest.fn(),
  first: jest.fn(),
  run: jest.fn(),
  batch: jest.fn(),
  exec: jest.fn(),
};

const mockEnv = {
  DB: mockD1 as any,
  JWT_SECRET: 'test-secret',
  ENVIRONMENT: 'test',
} as Env;

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService(mockEnv);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test', read: 0, actions: null, metadata: null }
      ];

      mockD1.all.mockResolvedValue({ results: mockNotifications });
      mockD1.first.mockResolvedValue({ total: 1 });

      const result = await service.findAll('user-1', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].read).toBe(false);
      expect(result.meta.total).toBe(1);
      expect(mockD1.prepare).toHaveBeenCalledTimes(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockD1.run.mockResolvedValue({ success: true });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result).toBe(true);
      expect(mockD1.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications SET read = 1')
      );
    });
  });
});
