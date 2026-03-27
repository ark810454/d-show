import { Type } from "class-transformer";
import { ShopProductStatus } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateShopProductDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  codeBarres?: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @Type(() => Number)
  @IsNumber()
  prixVente!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prixAchat?: number;

  @Type(() => Number)
  @IsNumber()
  stockActuel!: number;

  @Type(() => Number)
  @IsNumber()
  stockMinimum!: number;

  @IsOptional()
  @IsEnum(ShopProductStatus)
  statut?: ShopProductStatus;
}
