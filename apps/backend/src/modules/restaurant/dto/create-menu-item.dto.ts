import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

const MENU_ITEM_STATUSES = ["DISPONIBLE", "INDISPONIBLE"] as const;

class MenuItemOptionDto {
  @IsString()
  nom!: string;

  @IsNumber()
  @Min(0)
  prix!: number;
}

export class CreateMenuItemDto {
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
  @IsString()
  image?: string;

  @IsOptional()
  @IsIn(MENU_ITEM_STATUSES)
  statut?: (typeof MENU_ITEM_STATUSES)[number];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemOptionDto)
  options?: MenuItemOptionDto[];
}
