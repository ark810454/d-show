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
  @IsEnum(MenuItemStatus)
  statut?: MenuItemStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemOptionDto)
  options?: MenuItemOptionDto[];
}

