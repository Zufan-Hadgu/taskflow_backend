import { Controller, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { Get,Post,Patch,Delete,Param,Body} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateProjectWithTaskDto } from './dto/create-task-with-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/decorator';
import { CacheInterceptor } from "@nestjs/cache-manager";
import { Role, Roles } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@ApiTags('projects')
@UseGuards(JwtAuthGuard)
@Controller('projects')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(CacheInterceptor) // Apply the interceptor to catch errors
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @ApiOperation({ summary: 'Get user projects' })
    @ApiQuery({ name: 'search', required: false })
    @Get ('me') // to query search for projects by name or description
    findAllUserProjects(
     
        @CurrentUser() user: {id:string; email:string},
        @Query('search')search?: string,
        
    ){
        console.log('Controller hit');
        return this.projectsService.findAllUserProjects(user.id,search);

    }
    @Roles(Role.Admin)
    @ApiOperation({ summary: 'Get all projects' })
    @ApiQuery({ name: 'search', required: false })
    @Get () // to query search for projects by name or description
    findAllProjects(
        @Query() dto: PaginationDto,
        @Query('search')search?: string,
        
    ){
        console.log("DTO",dto)
        return this.projectsService.findAll(dto, search);
    }

    

    @ApiOperation({ summary: 'Get a project by ID' })
    @ApiQuery({ name: 'id', required: true })
    @Get (":id") // to query a project by id
    findOne(
        @CurrentUser() user: { id: string; email: string },
        @Param('id') id: string,

    ){
        return this.projectsService.findOne(id,user.id);
    }

    @Post ()
    @ApiOperation({ summary: 'Create a new project' })
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

