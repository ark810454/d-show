import { IsIn, IsOptional, IsString } from "class-validator";

const RESTAURANT_KITCHEN_STATUSES = ["EN_ATTENTE", "EN_PREPARATION", "PRET", "SERVI", "ANNULE"] as const;

export class UpdateRestaurantOrderStatusDto {
  @IsIn(RESTAURANT_KITCHEN_STATUSES)
  statutCuisine!: (typeof RESTAURANT_KITCHEN_STATUSES)[number];

  @IsOptional()
  @IsString()
  handledByUserId?: string;
}
