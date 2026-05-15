import { ValidateNested } from "class-validator";
import { CreateProjectDto } from "./create-project.dto";
import { Type } from "class-transformer";
import { CreateTaskDto } from "src/tasks/dto/create-task.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProjectWithTaskDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => CreateProjectDto)
    project: CreateProjectDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => CreateTaskDto)
    task: CreateTaskDto;
}