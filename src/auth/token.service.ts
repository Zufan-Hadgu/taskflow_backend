import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}
    generateAccessToken(payload: Record<string, unknown>) {
        return this.jwtService.sign(payload);
    }

    verifyToken(token: string) {
        return this.jwtService.verify(token);
    }
}