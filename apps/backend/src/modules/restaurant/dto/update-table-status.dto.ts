import { ResourceStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateRestaurantTableStatusDto {
  @IsEnum(ResourceStatus)
  statut!: ResourceStatus;
}

