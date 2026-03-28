import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

const RESTAURANT_RESOURCE_STATUSES = ["LIBRE", "OCCUPEE", "RESERVEE", "EN_NETTOYAGE"] as const;

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
  @IsIn(RESTAURANT_RESOURCE_STATUSES)
  statut?: (typeof RESTAURANT_RESOURCE_STATUSES)[number];
}
