import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private tokenService: TokenService,
        private userService: UsersService

    ) {}

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        const user =  await this.userService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password: _, ...result } = user;
        
        return {
        user: result,
        access_token: this.tokenService.generateAccessToken({
            sub: user.id, 
            email: user.email
        }),
        };  
    }

    async register(registerUserDto: RegisterUserDto) {
        const { name, email, password } = registerUserDto;
    
        const user = await this.userService.createUser(
            name,
            email, 
            password, 
        
        );
        const {password: _, ...result} = user;
        return {
            user:result,
            access_token: this.tokenService.generateAccessToken({
                 sub: user.id, 
                email: user.email
            }),
        }
    }
}
