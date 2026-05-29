import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and save a new user', async () => {
      const name = 'Test';
      const email = 'test@example.com';
      const password = 'password123';
      const hashed = 'hashed-password';

      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
      mockUserRepo.save.mockResolvedValue({
        id: 'user-1',
        name,
        email,
        password: hashed,
      });

      const result = await service.createUser(name, email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockUserRepo.save).toHaveBeenCalledWith({
        name,
        email,
        password: hashed,
      });
      expect(result.email).toBe(email);
    });

    it('should throw if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

      await expect(
        service.createUser('Test', 'test@example.com', 'password123'),
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 'u1', name: 'Alice', email: 'alice@example.com' },
        { id: 'u2', name: 'Bob', email: 'bob@example.com' },
      ];
      mockUserRepo.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 'u1', email: 'alice@example.com' };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('alice@example.com');
      expect(result).toEqual(user);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 'u1', name: 'Alice' };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.findOne('u1');
      expect(result).toEqual(user);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const existing = { id: 'u1', name: 'zufan', email: 'zufan@example.com' };
      const updateData = { name: 'zufan Updated' };
      const updated = { ...existing, ...updateData };

      mockUserRepo.findOne.mockResolvedValue({ ...existing });
      mockUserRepo.save.mockResolvedValue(updated);

      const result = await service.updateUser('u1', updateData);
      expect(result.name).toBe('Alice Updated');
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.updateUser('nonexistent', { name: 'X' });
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      const user = { id: 'u1', name: 'Alice' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUser('u1');
      expect(result).toEqual(user);
      expect(mockUserRepo.delete).toHaveBeenCalledWith('u1');
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.deleteUser('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should return the user if credentials are valid', async () => {
      const user = { id: 'u1', email: 'alice@example.com', password: 'hashed' };
      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('alice@example.com', 'password123');
      expect(result).toEqual(user);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = { id: 'u1', email: 'alice@example.com', password: 'hashed' };
      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('alice@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user without the password field', async () => {
      const user = {
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed',
      };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.getProfile('u1');
      expect(result).toEqual({ id: 'u1', name: 'Alice', email: 'alice@example.com' });
      expect((result as any).password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.getProfile('nonexistent');
      expect(result).toBeNull();
    });
  });
});
