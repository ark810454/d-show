import { NightclubBookingType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, Min } from "class-validator";

export class CreateNightclubBookingDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  assigneeUserId?: string;

  @IsEnum(NightclubBookingType)
  typeReservation!: NightclubBookingType;

  @IsDateString()
  dateEvenement!: string;

  @IsOptional()
  @IsDateString()
  heureDebut?: string;

  @IsOptional()
  @IsDateString()
  heureFin?: string;

  @Type(() => Number)
  @Min(1)
  nombrePersonnes!: number;

  totalTtc!: number;

  @IsOptional()
  acompte?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
