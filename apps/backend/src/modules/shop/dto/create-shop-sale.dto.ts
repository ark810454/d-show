import { PaymentMethod } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

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

  @IsEnum(PaymentMethod)
  modePaiement!: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShopSaleItemDto)
  items!: CreateShopSaleItemDto[];
}
