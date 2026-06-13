import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AuthService {
    constructor(
        @InjectQueue('email') 
        private readonly emailQueue: Queue,
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
            email: user.email,
            role: user.role
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

        await this.emailQueue.add(
        'welcome-email',
        {
            userId: user.id,
            email: user.email,
        },
        {
            attempts: 5,

            backoff: {
            type: 'exponential',
            delay: 5000,
            },

            removeOnComplete: 1000,
            removeOnFail: 5000,
        },
        );
        return {
            user:result,
            access_token: this.tokenService.generateAccessToken({
                sub: user.id, 
                email: user.email,
                role: user.role
            }),
        }
    }
}
