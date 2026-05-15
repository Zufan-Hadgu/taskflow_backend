import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { Body, Post } from '@nestjs/common';
import { Request } from '@nestjs/common';



@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get("profile")
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }
}
