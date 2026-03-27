import { ResourceStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateRestaurantTableDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsInt()
  @Min(1)
  capacite!: number;

  @IsOptional()
  @IsEnum(ResourceStatus)
  statut?: ResourceStatus;
}

