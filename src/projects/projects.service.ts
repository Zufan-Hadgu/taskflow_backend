import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectWithTaskDto } from './dto/create-task-with-dto';
import { Task } from 'src/tasks/entities/task.entity';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';

@Injectable()
export class ProjectsService {

    constructor(
        @InjectRepository(Project)
        private projectRepo: Repository<Project>,
        @InjectRepository(Task)
        private taskRepo: Repository<Task>,
        private datasource: DataSource,
    ) {}

    findAll(userId: string, search?: string) {
        if (search) {
            return this.projectRepo.find({
                where: {
                    user: { id: userId },
                    name: ILike(`%${search}%`),
                },
            });
        }
        return this.projectRepo.find({ where: { user: { id: userId } } });
    }
        

    findOne(id: string, userId: string) {
        return this.projectRepo.findOne({
            where: { id, user: { id: userId } },
        });
    }

    async createTask(
        projectId: string,
        userId: string,
        dto: CreateTaskDto,
    ): Promise<Task> {
        const project = await this.projectRepo.findOne({
            where: { id: projectId, user: { id: userId } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        const task = this.taskRepo.create({
            title: dto.title,
            isComplete: false,
            project,
        });
        return this.taskRepo.save(task);
    }

    async create(createProjectDto: CreateProjectDto,userId: string):Promise<Project> {

        const project = this.projectRepo.create({
            ...createProjectDto,
            user:{id:userId}});
        return this.projectRepo.save(project);
    }
    async update (id: string, updateProjectDto: UpdateProjectDto, userId: string){
        const project = await this.projectRepo.findOne({ 
        where: { 
            id: id, 
            user: { id: userId } 
        } 
        });
        if (!project) {
            throw new Error(`Project with id ${id} not found`);
        }
        try{
            Object.assign(project, updateProjectDto);
            return this.projectRepo.save(project);
        } catch (error) {
            throw new Error(`Failed to update project with id ${id}: ${error.message}`);
        }

        
    }

    async remove(id:string,userId: string){
        const result = await this.projectRepo.delete({ id, user: { id: userId } });
        if (result.affected === 0) {
            throw new Error(`Project with id ${id} not found`);
        }
        return { message: `Project with id ${id} deleted successfully` };
    }

    async createWithFirstTask(dto: CreateProjectWithTaskDto,userId: string) {


        return this.datasource.transaction(async (manager) => {
             const project = manager.create(Project, {
                ...dto.project,
                user:{id:userId}
            });
            const savedProject = await manager.save(project);

            const task = manager.create(Task, {
                title: dto.task.title,
                isComplete: false,
                project: savedProject,
            });
            await manager.save(task);

            return savedProject;
        }

        
        );
    }
}
