import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Post } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { Role } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';



@ApiTags('users')
@UseGuards(JwtAuthGuard,RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get("profile")
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }
  @Roles(Role.Admin)
  @Get('all-users')
  findAllUsers(
    @Query() userDto: PaginationDto,  
  ) {
    return this.usersService.findAll(userDto);
  }

}
