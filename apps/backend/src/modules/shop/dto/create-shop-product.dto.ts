import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

const SHOP_PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

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
  @IsIn(SHOP_PRODUCT_STATUSES)
  statut?: (typeof SHOP_PRODUCT_STATUSES)[number];
}
