import { ShopProductStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

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
  @IsEnum(ShopProductStatus)
  statut?: ShopProductStatus;
}
