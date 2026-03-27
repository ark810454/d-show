import { IsOptional, IsString } from "class-validator";

export class CreateNightclubBottleCategoryDto {
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
