import { IsIn } from "class-validator";

const RESTAURANT_RESOURCE_STATUSES = ["LIBRE", "OCCUPEE", "RESERVEE", "EN_NETTOYAGE"] as const;

export class UpdateRestaurantTableStatusDto {
  @IsIn(RESTAURANT_RESOURCE_STATUSES)
  statut!: (typeof RESTAURANT_RESOURCE_STATUSES)[number];
}
