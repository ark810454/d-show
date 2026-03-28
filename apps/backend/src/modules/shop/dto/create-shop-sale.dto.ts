import { Type } from "class-transformer";
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

const PAYMENT_METHODS = ["CASH", "CARTE", "MOBILE_MONEY", "VIREMENT"] as const;

class CreateShopSaleItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  libelle!: string;

  @Type(() => Number)
  @IsNumber()
  quantite!: number;

  @Type(() => Number)
  @IsNumber()
  prixUnitaire!: number;
}

export class CreateShopSaleDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;

  @Type(() => Number)
  @IsNumber()
  remise!: number;

  @Type(() => Number)
  @IsNumber()
  taxeMontant!: number;

  @IsIn(PAYMENT_METHODS)
  modePaiement!: (typeof PAYMENT_METHODS)[number];

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShopSaleItemDto)
  items!: CreateShopSaleItemDto[];
}
