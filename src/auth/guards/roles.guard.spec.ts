import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

const mockExecutionContext = (user: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const context = mockExecutionContext({
        role: 'user',
      }) as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = mockExecutionContext({
        role: 'admin',
      }) as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = mockExecutionContext({
        role: 'user',
      }) as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should call reflector with handler and class', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = mockExecutionContext({
        role: 'admin',
      }) as ExecutionContext;

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });
  });
});