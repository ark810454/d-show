import { MenuItemStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

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
  @IsEnum(MenuItemStatus)
  statut?: MenuItemStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMenuItemOptionDto)
  options?: UpdateMenuItemOptionDto[];
}
