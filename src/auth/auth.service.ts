import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';

@Injectable()
export class AuthService {
    constructor(private tokenService: TokenService) {}
    private users: any[] = []

    async validateUser(email: string, password: string): Promise<any> {

            if (email !== 'zufanhadgu1@gmail.com' && password !== '12341234') {
                throw new UnauthorizedException('Invalid credentials');
               
            }  
            return { id: '1', email,};
    }
       

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        const user = await this.validateUser(email, password);
        const payload = 
        { 
            sub: user.id,
            email: user.email 
        };   
        return {
            access_token: this.tokenService.generateAccessToken(payload),
        };   
    }

    async register(registerUserDto: RegisterUserDto) {

        const { name, email, password, confirmPassword } = registerUserDto;

        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }
        const newUser = {
            id: Date.now().toString(),
            name: registerUserDto.name,
            email: registerUserDto.email,
            password: registerUserDto.password, 
        };
        this.users.push(newUser);
        return newUser;
    }
}
