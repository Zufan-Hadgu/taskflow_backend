import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variables to store secrets
      signOptions: { expiresIn: '1h' },
    }),

  ],
  providers: [AuthService,JwtStrategy,TokenService],
  controllers: [AuthController]
})
export class AuthModule {}
