import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const mockProjectsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createWithFirstTask: jest.fn(),
};

const mockUser = { id: 'user-1', email: 'test@example.com' };

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects for the user', async () => {
      const projects = [
        { id: 'p1', name: 'Project 1' },
        { id: 'p2', name: 'Project 2' },
      ];
      mockProjectsService.findAll.mockResolvedValue(projects);

      const result = await controller.findAllUserProjects(mockUser);
      expect(result).toEqual(projects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('user-1', undefined);
    });

    it('should pass the search query to the service', async () => {
      mockProjectsService.findAll.mockResolvedValue([]);

      await controller.findAllUserProjects(mockUser, 'test');
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('user-1', 'test');
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const project = { id: 'p1', name: 'Project 1' };
      mockProjectsService.findOne.mockResolvedValue(project);

      const result = await controller.findOne(mockUser, 'p1');
      expect(result).toEqual(project);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('p1', 'user-1');
    });
  });

  describe('create', () => {
    it('should create and return a new project', async () => {
      const dto = { name: 'New Project', description: 'A description' };
      const created = { id: 'p1', ...dto, user: { id: 'user-1' } };
      mockProjectsService.create.mockResolvedValue(created);

      const result = await controller.create(dto, mockUser);
      expect(result).toEqual(created);
      expect(mockProjectsService.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('Update', () => {
    it('should update and return the project', async () => {
      const dto = { name: 'Updated Name' };
      const updated = { id: 'p1', name: 'Updated Name', user: { id: 'user-1' } };
      mockProjectsService.update.mockResolvedValue(updated);

      const result = await controller.Update('p1', dto, mockUser);
      expect(result).toEqual(updated);
      expect(mockProjectsService.update).toHaveBeenCalledWith('p1', dto, 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete and return confirmation', async () => {
      const response = { message: 'Project with id p1 deleted successfully' };
      mockProjectsService.remove.mockResolvedValue(response);

      const result = await controller.remove('p1', mockUser);
      expect(result).toEqual(response);
      expect(mockProjectsService.remove).toHaveBeenCalledWith('p1', 'user-1');
    });
  });

  describe('createWithFirstTask', () => {
    it('should create a project with a task and return it', async () => {
      const dto = {
        project: { name: 'New Project' },
        task: { title: 'First Task' },
      };
      const created = { id: 'p1', name: 'New Project', user: { id: 'user-1' } };
      mockProjectsService.createWithFirstTask.mockResolvedValue(created);

      const result = await controller.createWithFirstTask(dto as any, mockUser);
      expect(result).toEqual(created);
      expect(mockProjectsService.createWithFirstTask).toHaveBeenCalledWith(dto, 'user-1');
    });
  });
});
