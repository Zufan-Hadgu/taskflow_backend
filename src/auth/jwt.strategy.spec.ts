import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

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
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from a valid payload', async () => {
      const payload = { sub: 'user-1', email: 'test@example.com', role: 'user' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should map sub to id', async () => {
      const payload = { sub: 'abc-123', email: 'a@b.com', role: 'admin' };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('abc-123');
      expect(result).not.toHaveProperty('sub');
    });

    it('should throw UnauthorizedException if sub is missing', async () => {
      const payload = { sub: '', email: 'test@example.com', role: 'user' };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if sub is undefined', async () => {
      const payload = { sub: undefined, email: 'test@example.com', role: 'user' } as any;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle payload without optional email', async () => {
      const payload = { sub: 'user-1', email: undefined, role: 'user' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-1',
        email: undefined,
        role: 'user',
      });
    });
  });
});
