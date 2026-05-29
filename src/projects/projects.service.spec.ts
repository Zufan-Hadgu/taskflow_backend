import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { DataSource } from 'typeorm';

const mockProjectRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockTaskRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = {
        name: 'Project 1',
      };
      const userId = 'user-123';
      const saved = { id: 'proj-1', ...dto, user: { id: userId } };

      mockProjectRepo.create.mockReturnValue(saved);
      mockProjectRepo.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, userId);
      expect(result.name).toBe('Project 1');
      expect(mockProjectRepo.create).toHaveBeenCalledWith({
        ...dto,
        user: { id: userId },
      });
    });
  });

  describe('remove', () => {
    it('should delete the project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';

      mockProjectRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(projectId, userId);
      expect(result).toEqual({
        message: `Project with id ${projectId} deleted successfully`,
      });
    });
  });

  describe('update', () => {
    it('should update the project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateDto = {
        name: 'Updated Project',
      };
      const existing = { id: projectId, name: 'Old', user: { id: userId } };
      const updated = { ...existing, ...updateDto };

      mockProjectRepo.findOne.mockResolvedValue(existing);
      mockProjectRepo.save.mockResolvedValue(updated);

      const result = await service.update(projectId, updateDto as any, userId);
      expect(result.name).toBe('Updated Project');
    });
  });

  describe('findOne', () => {
    it('should find a project by id', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const project = {
        id: projectId,
        name: 'Project 1',
        user: { id: userId },
      };

      mockProjectRepo.findOne.mockResolvedValue(project);

      const result = await service.findOne(projectId, userId);
      expect(result).toEqual(project);
    });
  });

  describe('findAll', () => {
    it('should find all projects for a user', async () => {
      const userId = 'user-123';
      const projects = [
        { id: 'project-1', name: 'Project 1', user: { id: userId } },
        { id: 'project-2', name: 'Project 2', user: { id: userId } },
      ];

      mockProjectRepo.find.mockResolvedValue(projects);

      const result = await service.findAll(userId);
      expect(result).toEqual(projects);
    });
  });
});
