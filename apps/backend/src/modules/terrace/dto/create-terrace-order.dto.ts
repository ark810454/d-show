import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

class TerraceOrderItemDto {
  @IsOptional()
  @IsString()
  menuItemId?: string;

  @IsString()
  libelle!: string;

  @Type(() => Number)
  quantite!: number;

  @Type(() => Number)
  prixUnitaire!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateTerraceOrderDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  terraceTableId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerraceOrderItemDto)
  items!: TerraceOrderItemDto[];
}

