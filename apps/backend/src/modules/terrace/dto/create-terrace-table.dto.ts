import { ResourceStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

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
  @IsEnum(ResourceStatus)
  statut?: ResourceStatus;
}

