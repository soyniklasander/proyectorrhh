import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash,
        role: 'admin',
        nombres: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: null,
        estado: 'ACTIVO',
        lastLogin: null
      };

      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', password);

      expect(result).toBeDefined();
      expect(result.id).toEqual(user.id);
      expect(result.passwordHash).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash,
        role: 'admin',
        nombres: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: null,
        estado: 'ACTIVO',
        lastLogin: null
      };

      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
