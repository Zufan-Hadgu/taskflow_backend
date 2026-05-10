
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string; 
    
    @ApiProperty()
    @MinLength(8)
    password: string;

    @ApiProperty()
    confirmPassword: string;
}