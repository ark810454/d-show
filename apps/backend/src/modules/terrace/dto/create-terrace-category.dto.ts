import { IsOptional, IsString } from "class-validator";

export class CreateTerraceCategoryDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

