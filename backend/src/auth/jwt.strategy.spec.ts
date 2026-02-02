import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user object with userId and companyId (Worker payload)', async () => {
    const payload = {
      userId: 'user-123',
      companyId: 'company-456',
      role: 'admin',
      iat: 1234567890,
      exp: 1234567890,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      companyId: 'company-456',
      email: undefined,
      role: 'admin',
    });
  });

  it('should validate and return user object with id from sub (Standard payload)', async () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'user',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123', // Mapped from sub
      companyId: undefined,
      email: 'test@example.com',
      role: 'user',
    });
  });
});
