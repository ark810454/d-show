import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateNightclubBottleItemDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  nom!: string;

  prix!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  estPack?: boolean;

  @IsOptional()
  @IsBoolean()
  vipOnly?: boolean;
}
