import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

class NightclubBottleOrderItemDto {
  @IsOptional()
  @IsString()
  bottleItemId?: string;

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

export class CreateNightclubBottleOrderDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NightclubBottleOrderItemDto)
  items!: NightclubBottleOrderItemDto[];
}
