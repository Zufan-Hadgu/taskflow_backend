import { Controller, Query, Req, UseGuards } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { Get,Post,Patch,Delete,Param,Body} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Project } from './entities/project.entity';
import { CreateProjectWithTaskDto } from './dto/create-task-with-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator';

@ApiTags('projects')
@UseGuards(JwtAuthGuard)
@Controller('projects')
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @ApiOperation({ summary: 'Get all projects' })
    @ApiQuery({ name: 'search', required: false })
    @Get () // to query search for projects by name or description
    findAll(
        @CurrentUser() user: {id:string; email:string},
        @Query('search')search?: string,
        
    ){
        return this.projectsService.findAll(user.id,search);

    }
    @ApiOperation({ summary: 'Get a project by ID' })
    @ApiQuery({ name: 'id', required: true })
    @Get (":id") // to query a project by id
    findOne(
        @CurrentUser() user: { id: string; email: string },
        @Query('id') id: string,

    ){
        return this.projectsService.findOne(id,user.id);
    }

    @Post ()
    @ApiOperation({ summary: 'Create a new project' })
    @Post()
    async create(
        @Body() creatProjectDto: CreateProjectDto,
        @CurrentUser() user: { id: string; email: string }
    ) {
        return this.projectsService.create(creatProjectDto, user.id);
    }

    @ApiOperation({ summary: 'Update a project by ID' })
    @ApiParam({ name: 'id', required: true })
    @Patch(":id")
    Update(
        @Param("id") id:string,
        @Body() updateProjectDto: UpdateProjectDto,
        @CurrentUser() user: { id: string; email: string }
    )
        
    {
        return this.projectsService.update(id, updateProjectDto,user.id);

    }

    @ApiOperation({ summary: 'Delete a project by ID' })
    @ApiParam({ name: 'id', required: true })
    @Delete(':id')
    remove(@Param('id') id: string,
    @CurrentUser() user: { id: string; email: string }
    ) {
    return this.projectsService.remove(id,user.id);
  }
  @ApiOperation({ summary: 'Create a project with a first task' })
  @ApiBody({ type: CreateProjectWithTaskDto })
  @Post('with-task')
  async createWithFirstTask(
    @Body() createProjectWithTaskDto: CreateProjectWithTaskDto,
    @CurrentUser() user: { id: string; email: string }
  ) {
    return this.projectsService.createWithFirstTask(createProjectWithTaskDto, user.id);
  }
}
