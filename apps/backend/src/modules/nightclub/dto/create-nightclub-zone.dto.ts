import { ResourceStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateNightclubZoneDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  code!: string;

  @IsString()
  nom!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacite!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ResourceStatus)
  statut?: ResourceStatus;
}
