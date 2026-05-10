import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(private tokenService: TokenService) {}
    private users: any[] = []

    async validateUser(email: string, password: string): Promise<any> {

            if (email === 'zufanhadgu1@gmail.com' && password === '12341234') {
                return { id: 1, email: email };
            }   else{
                return "Invalid credentials";
            }
    }
       

    async login(user: any) {
        const payload = 
        { 
            sub: user.id,
            email: user.email 
        };   
        return {
            access_token: this.tokenService.generateAccessToken(payload),
        };   
    }

    async register(dto: any) {
        // In a real application, you would save the user to a database
        const newUser = {
            id: Date.now().toString(),
            email: dto.email,
            password: dto.password, // In a real application, never store plain passwords
        };
        this.users.push(newUser);
        return newUser;
    }
}
