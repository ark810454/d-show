import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateShopPromotionDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  productId!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  reductionType!: string;

  reductionValeur!: number;

  @IsDateString()
  dateDebut!: string;

  @IsDateString()
  dateFin!: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
