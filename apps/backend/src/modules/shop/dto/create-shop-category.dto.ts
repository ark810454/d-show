import { IsOptional, IsString } from "class-validator";

export class CreateShopCategoryDto {
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
