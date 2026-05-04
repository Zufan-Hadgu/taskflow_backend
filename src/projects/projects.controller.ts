import { Controller, Query } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { Get,Post,Patch,Delete,Param,Body} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @ApiOperation({ summary: 'Get all projects' })
    @ApiQuery({ name: 'search', required: false })
    @Get () // to query search for projects by name or description
    findAll(@Query('search')search?: string){
        return this.projectsService.findAll(search);

    }
    @ApiOperation({ summary: 'Get a project by ID' })
    @ApiQuery({ name: 'id', required: true })
    @Get (":id") // to query a project by id
    findOne(@Query('id') id: string){
        return this.projectsService.findOne(id);
    }

    @Post ()
    @ApiOperation({ summary: 'Create a new project' })
    create(@Body() creatProjectDto: CreateProjectDto){
        return this.projectsService.create(creatProjectDto);
    }
    @ApiOperation({ summary: 'Update a project by ID' })
    @ApiParam({ name: 'id', required: true })
    @Patch(":id")
    Update(
        @Param("id") id:string,
        @Body() updateProjectDto: UpdateProjectDto)
    {
        return this.projectsService.update(id, updateProjectDto);

    }
    @ApiOperation({ summary: 'Delete a project by ID' })
    @ApiParam({ name: 'id', required: true })
    @Delete(':id')
    remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
