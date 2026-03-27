import { NightclubEventStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateNightclubEventDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  djInvite?: string;

  @IsDateString()
  dateEvenement!: string;

  @IsOptional()
  @IsDateString()
  heureOuverture?: string;

  @IsOptional()
  @IsDateString()
  heureFermeture?: string;

  prixEntree!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(NightclubEventStatus)
  statut?: NightclubEventStatus;
}
