
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
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

    @IsString()
    @MinLength(6)
    @ValidateIf((o) => o.password === o.confirmPassword)
    confirmPassword: string; 
}