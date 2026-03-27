import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTerraceItemDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  nom!: string;

  @IsNumber()
  @Min(0)
  prix!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  boissonUniquement?: boolean;
}

