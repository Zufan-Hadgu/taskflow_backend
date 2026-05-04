import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsService {
    private projects: any[] = [];
    findAll (search?: string){
        if (search){
            return this.projects.filter(p => p.name.includes(search.toLowerCase()),
        )
        }
        return this.projects;
    }

    findOne(id: string){
        return this.projects.find(p => p.id === id);
    }
    create(dto:any){
        const newProject = {
            id: (this.projects.length + 1).toString(),
            ...dto,
        };
        this.projects.push(newProject);
        return newProject;
    }
    update (id: string,dto:any){
        const project = this.findOne("id");
        Object.assign(project.dto);
        return project;
    }

    remove(id:string){
         this.projects = this.projects.filter(p => p.id !== id);
         return {deleted: true};
        
    }

}
