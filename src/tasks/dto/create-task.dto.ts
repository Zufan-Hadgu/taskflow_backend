import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({ example: 'Ship v1' })
    @IsString()
    title: string;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
    @IsOptional()
    @IsString()
    priority?: 'low' | 'medium' | 'high';

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dueDate?: Date;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assigneeId?: string;
}