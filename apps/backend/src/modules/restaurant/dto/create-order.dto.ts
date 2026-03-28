import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsIn,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

const PAYMENT_METHODS = ["CASH", "CARTE", "MOBILE_MONEY", "VIREMENT"] as const;

class CreateOrderItemDto {
  @IsOptional()
  @IsString()
  menuItemId?: string;

  @IsString()
  libelle!: string;

  @IsNumber()
  @Min(1)
  quantite!: number;

  @IsNumber()
  @Min(0)
  prixUnitaire!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateRestaurantOrderDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  serverId!: string;

  @IsString()
  tableId!: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  notesCuisine?: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  modePaiementInitial?: (typeof PAYMENT_METHODS)[number];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
