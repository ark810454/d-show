import { IsIn, IsOptional, IsString } from "class-validator";

const SHOP_PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export class UpdateShopProductDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  codeBarres?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  prixVente?: number;

  @IsOptional()
  prixAchat?: number;

  @IsOptional()
  stockActuel?: number;

  @IsOptional()
  stockMinimum?: number;

  @IsOptional()
  @IsIn(SHOP_PRODUCT_STATUSES)
  statut?: (typeof SHOP_PRODUCT_STATUSES)[number];
}
