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

class UpdateMenuItemOptionDto {
  @IsString()
  nom!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix!: number;
}

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix?: number;

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
  @Type(() => UpdateMenuItemOptionDto)
  options?: UpdateMenuItemOptionDto[];
}
