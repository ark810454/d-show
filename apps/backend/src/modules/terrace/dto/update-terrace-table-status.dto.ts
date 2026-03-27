import { ResourceStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateTerraceTableStatusDto {
  @IsEnum(ResourceStatus)
  statut!: ResourceStatus;
}
