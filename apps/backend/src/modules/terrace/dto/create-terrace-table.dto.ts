import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

const TERRACE_RESOURCE_STATUSES = ["LIBRE", "OCCUPEE", "RESERVEE"] as const;

export class CreateTerraceTableDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  emplacement?: string;

  @IsInt()
  @Min(1)
  capacite!: number;

  @IsOptional()
  @IsIn(TERRACE_RESOURCE_STATUSES)
  statut?: (typeof TERRACE_RESOURCE_STATUSES)[number];
}
