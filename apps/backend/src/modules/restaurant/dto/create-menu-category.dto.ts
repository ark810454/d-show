import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateMenuCategoryDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordre?: number;
}

