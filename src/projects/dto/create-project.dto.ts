
import { ApiProperty } from "@nestjs/swagger";
export class CreateProjectDto {
  name!: string;
  description?: string;
}